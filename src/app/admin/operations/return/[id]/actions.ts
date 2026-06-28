"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { differenceInHours } from "date-fns";

export async function processReturn(formData: FormData) {
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
  const conditionAfter = formData.get("conditionAfter") as string;
  const conditionScore = parseInt(formData.get("conditionScore") as string || "10");
  const penaltyAmount = parseInt(formData.get("penaltyAmount") as string || "0");
  const penaltyReason = formData.get("penaltyReason") as string;
  const returnedDeposit = formData.get("returnedDeposit") === "true";
  const returnedIdentity = formData.get("returnedIdentity") === "true";

  if (!bookingId) {
    return { error: "Booking ID tidak valid" };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        items: true, 
        identityHold: true,
        deposits: true
      }
    });

    if (!booking) return { error: "Booking tidak ditemukan" };

    if (!returnedIdentity && booking.identityHold?.status === "HELD") {
      return { error: "Anda harus mengonfirmasi pengembalian KTP jaminan." };
    }

    const hasDeposit = booking.securityDepositAmount && Number(booking.securityDepositAmount) > 0;
    if (hasDeposit && !returnedDeposit) {
      return { error: "Anda harus mengonfirmasi pengembalian Security Deposit." };
    }

    const checkinTime = new Date();
    // Calculate if late
    const hoursLate = differenceInHours(checkinTime, new Date(booking.dueTime));
    const isLate = hoursLate > 1; // 1 hour tolerance

    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Return Identity Hold
      if (booking.identityHold && booking.identityHold.status === "HELD") {
        await tx.identityHold.update({
          where: { id: booking.identityHold.id },
          data: {
            status: "RETURNED",
            returnedBy: user.id,
            returnedAt: checkinTime
          }
        });
      }

      // 2. Return Deposit
      if (hasDeposit) {
        await tx.depositTransaction.create({
          data: {
            bookingId,
            action: penaltyAmount > 0 ? "REFUNDED_PARTIAL" : "REFUNDED_FULL",
            amount: Number(booking.securityDepositAmount) - penaltyAmount, // Simplification
            processedBy: user.id,
            reason: penaltyAmount > 0 ? `Dipotong denda: ${penaltyReason}` : "Pengembalian Normal"
          }
        });
      }

      // 3. Record Penalty if any
      if (penaltyAmount > 0) {
        await tx.penalty.create({
          data: {
            bookingId,
            type: "OTHER", // Can be calculated based on hoursLate too
            description: penaltyReason || (isLate ? `Terlambat ${hoursLate} jam` : "Denda kerusakan/hilang"),
            amount: penaltyAmount,
            createdBy: user.id
          }
        });
      }

      // 4. Update Booking Item final condition and Camera stats
      if (booking.items[0]) {
        await tx.bookingItem.update({
          where: { id: booking.items[0].id },
          data: { conditionAfter: conditionAfter || "Baik" }
        });
        
        await tx.camera.update({
          where: { id: booking.items[0].cameraId },
          data: { 
            status: "AVAILABLE",
            conditionScore: conditionScore,
            totalDaysRented: { increment: booking.duration },
            totalTimesRented: { increment: 1 }
          }
        });
      }

      // 5. Update Booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "COMPLETED",
          checkinAt: checkinTime,
          isLate: isLate,
          lateMinutes: isLate ? hoursLate * 60 : 0
        }
      });
    });

    revalidatePath(`/admin/operations`);
    revalidatePath(`/admin/operations/return/${bookingId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Return process error:", error);
    return { error: error.message || "Terjadi kesalahan saat memproses pengembalian" };
  }
}
