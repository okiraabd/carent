"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function uploadPaymentProof(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const bookingId = formData.get("bookingId") as string;
  // In a real app, you would upload the file to Supabase Storage and get the URL.
  // For this demo, we will just simulate success and update the status.
  const paymentMethod = formData.get("paymentMethod") as string || "BCA Transfer";

  if (!bookingId) {
    return { error: "Booking ID tidak valid" };
  }

  try {
    // Simulate updating payment status to PENDING_VERIFICATION (or just set paymentStatus to 'UNPAID' and booking status to PENDING/AWAITING)
    // Wait, the context says admin verifies. So we just update the paymentStatus to 'VERIFIED' directly for the sake of demo? 
    // No, let's just create a Payment record with status 'PENDING'.
    
    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId }
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "PENDING",
          notes: `Simulasi transfer via: ${paymentMethod}`
        }
      });
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentMethod }
      });
    } else {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }});
      if (!booking) return { error: "Booking tidak ditemukan" };

      await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.bookingPaymentAmount,
          type: "BOOKING_PAYMENT",
          status: "PENDING",
          notes: `Simulasi transfer via: ${paymentMethod}`
        }
      });
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentMethod }
      });
    }

    // Update booking status to PENDING_VERIFICATION or keep AWAITING_PAYMENT?
    // Let's just keep it AWAITING_PAYMENT and rely on Payment status, or update booking to "CONFIRMED" directly if we skip admin verify?
    // Let's stick to the plan: Admin verifies it. So booking status = "AWAITING_PAYMENT", but Payment = "PENDING".
    // Wait, let's just make it simple: Change booking paymentStatus to 'PENDING'. Prisma schema says `PaymentStatus` is UNPAID, PARTIAL, PAID, REFUNDED. 
    // Wait, there's no PENDING in PaymentStatus. Let's just use a simulated delay and return success.

    // For demo purposes, we will just simulate the payment is uploaded. We don't have a "PENDING_VERIFICATION" status in schema.
    // Let's just leave paymentStatus as UNPAID, but create a Payment record with status "PENDING" to indicate user has uploaded.

    revalidatePath(`/bookings/${bookingId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Payment upload error:", error);
    return { error: "Gagal mengunggah bukti pembayaran" };
  }
}
