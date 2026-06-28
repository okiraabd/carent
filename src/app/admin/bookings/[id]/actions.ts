"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";

export async function verifyPayment(bookingId: string) {
  try {
    await requireAdmin();
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true }
    });

    if (!booking) return { error: "Booking tidak ditemukan" };

    // Update payment status to PAID
    const pendingPayment = booking.payments.find(p => p.status === "PENDING");
    if (pendingPayment) {
      await prisma.payment.update({
        where: { id: pendingPayment.id },
        data: { status: "VERIFIED" }
      });
    }

    // Update booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "VERIFIED"
      }
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath(`/admin/bookings`);
    return { success: true };
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return { error: "Terjadi kesalahan saat memverifikasi pembayaran" };
  }
}

export async function rejectPayment(bookingId: string) {
  try {
    await requireAdmin();
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true }
    });

    if (!booking) return { error: "Booking tidak ditemukan" };

    // Update payment status to REFUNDED/FAILED
    const pendingPayment = booking.payments.find(p => p.status === "PENDING");
    if (pendingPayment) {
      await prisma.payment.update({
        where: { id: pendingPayment.id },
        data: { status: "REJECTED" } 
      });
    }

    // Update booking status to REJECTED_PAYMENT
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "REJECTED_PAYMENT",
        paymentStatus: "REJECTED"
      }
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath(`/admin/bookings`);
    return { success: true };
  } catch (error: any) {
    console.error("Reject payment error:", error);
    return { error: "Terjadi kesalahan saat menolak pembayaran" };
  }
}
