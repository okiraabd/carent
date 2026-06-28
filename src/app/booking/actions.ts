"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";
import { differenceInDays, addDays } from "date-fns";

function generateBookingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRX-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createBookingDraft(formData: FormData) {
  let user;
  try {
    const auth = await requireUser();
    user = auth.user;
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  });

  if (!profile || !profile.phone) {
    return { error: "Profil belum lengkap" };
  }

  const cameraId = formData.get("cameraId") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const notes = formData.get("notes") as string;

  if (!cameraId || !startDateStr || !endDateStr) {
    return { error: "Data booking tidak lengkap" };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (startDate >= endDate) {
    return { error: "Tanggal selesai harus lebih besar dari tanggal mulai" };
  }
  
  if (startDate < new Date(new Date().setHours(0,0,0,0))) {
    return { error: "Tidak bisa booking di masa lalu" };
  }

  const durationDays = differenceInDays(endDate, startDate);

  const camera = await prisma.camera.findUnique({
    where: { id: cameraId }
  });

  if (!camera || camera.status !== "AVAILABLE") {
    return { error: "Kamera tidak tersedia" };
  }

  // Calculate pricing
  const subtotal = Number(camera.dailyRate) * durationDays;
  const securityDepositAmount = camera.isHighValue ? 500000 : 200000;
  const totalAmount = subtotal; // Security deposit is tracked separately or as part of total? Based on schema, totalAmount usually includes subtotal, and security deposit is extra/returned. Let's make totalAmount = subtotal. 
  const bookingPaymentAmount = subtotal * 0.3; // 30% DP

  try {
    const booking = await prisma.booking.create({
      data: {
        bookingCode: generateBookingCode(),
        profileId: profile.id,
        startDate,
        endDate,
        dueTime: endDate, // Same day return by default
        duration: durationDays,
        status: "AWAITING_PAYMENT",
        totalAmount,
        subtotal,
        securityDepositAmount,
        bookingPaymentAmount,
        paymentStatus: "UNPAID",
        notes,
        expiresAt: addDays(new Date(), 1), // Expire in 1 day if not paid
        items: {
          create: {
            cameraId: camera.id,
            dailyRate: camera.dailyRate,
            subtotal: subtotal
          }
        }
      }
    });

    return { success: true, bookingId: booking.id };
  } catch (error: any) {
    console.error("Booking error:", error);
    return { error: "Terjadi kesalahan saat memproses booking" };
  }
}
