"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";

export async function updateCameraStatus(cameraId: string, status: any) {
  try {
    await requireAdmin();
    await prisma.camera.update({
      where: { id: cameraId },
      data: { status }
    });
    
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Gagal memperbarui status" };
  }
}

export async function createCamera(formData: FormData) {
  try {
    await requireAdmin();
    const code = formData.get("code") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const dailyRate = Number(formData.get("dailyRate"));
    const weekendRate = formData.get("weekendRate") ? Number(formData.get("weekendRate")) : dailyRate;
    const conditionScore = Number(formData.get("conditionScore")) || 10;
    const storageLocation = formData.get("storageLocation") as string;
    const description = formData.get("description") as string;
    const isHighValue = formData.get("isHighValue") === "true";

    // Check code uniqueness
    const existing = await prisma.camera.findUnique({ where: { code } });
    if (existing) {
      return { success: false, error: "Kode Unit sudah digunakan!" };
    }

    await prisma.camera.create({
      data: {
        code, brand, model, dailyRate, weekendRate, conditionScore, storageLocation, description, isHighValue
      }
    });

    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to create camera:", error);
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}

export async function updateCamera(id: string, formData: FormData) {
  try {
    await requireAdmin();
    const code = formData.get("code") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const dailyRate = Number(formData.get("dailyRate"));
    const weekendRate = formData.get("weekendRate") ? Number(formData.get("weekendRate")) : dailyRate;
    const conditionScore = Number(formData.get("conditionScore")) || 10;
    const storageLocation = formData.get("storageLocation") as string;
    const description = formData.get("description") as string;
    const isHighValue = formData.get("isHighValue") === "true";

    // Check code uniqueness excluding this ID
    const existing = await prisma.camera.findUnique({ where: { code } });
    if (existing && existing.id !== id) {
      return { success: false, error: "Kode Unit sudah digunakan!" };
    }

    await prisma.camera.update({
      where: { id },
      data: {
        code, brand, model, dailyRate, weekendRate, conditionScore, storageLocation, description, isHighValue
      }
    });

    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to update camera:", error);
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}
