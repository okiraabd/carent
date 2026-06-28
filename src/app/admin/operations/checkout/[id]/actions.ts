"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth-utils";

export async function processCheckout(formData: FormData) {
  let user;
  try {
    const auth = await requireAdmin();
    user = auth.user;
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const bookingId = formData.get("bookingId") as string;
  const cardType = formData.get("cardType") as string;
  const cardHolderName = formData.get("cardHolderName") as string;
  const conditionBefore = formData.get("conditionBefore") as string;
  const depositCollected = formData.get("depositCollected") === "true";

  if (!bookingId || !cardType || !cardHolderName) {
    return { error: "Data jaminan identitas tidak lengkap" };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: { include: { camera: true } } }
    });

    if (!booking) return { error: "Booking tidak ditemukan" };

    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Create Identity Hold
      await tx.identityHold.create({
        data: {
          bookingId,
          cardType,
          cardHolderName,
          receivedBy: user.id,
          status: "HELD"
        }
      });

      // 2. Create Deposit Transaction if high value
      if (booking.securityDepositAmount && Number(booking.securityDepositAmount) > 0) {
        if (!depositCollected) throw new Error("Deposit keamanan belum dikonfirmasi");
        
        await tx.depositTransaction.create({
          data: {
            bookingId,
            action: "COLLECTED",
            amount: booking.securityDepositAmount,
            processedBy: user.id,
            reason: "Checkout Security Deposit"
          }
        });
      }

      // 3. Update Booking Item initial condition
      if (booking.items[0]) {
        await tx.bookingItem.update({
          where: { id: booking.items[0].id },
          data: { conditionBefore: conditionBefore || "Baik (Tanpa Cacat)" }
        });
        
        // Also update the Camera status
        await tx.camera.update({
          where: { id: booking.items[0].cameraId },
          data: { status: "RENTED" }
        });
      }

      // 4. Update Booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "ACTIVE_RENTAL",
          checkoutAt: new Date()
        }
      });
    });

    revalidatePath(`/admin/operations`);
    revalidatePath(`/admin/operations/checkout/${bookingId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Checkout process error:", error);
    return { error: error.message || "Terjadi kesalahan saat memproses checkout" };
  }
}
