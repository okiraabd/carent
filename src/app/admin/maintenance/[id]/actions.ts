"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";

export async function resolveMaintenance(formData: FormData) {
  await requireAdmin();
  const maintenanceId = formData.get("maintenanceId") as string;
  const resolution = formData.get("resolution") as string;
  const replacedParts = formData.get("replacedParts") as string;
  const actualCostStr = formData.get("actualCost") as string;
  const cameraStatus = formData.get("cameraStatus") as any; // AVAILABLE or BROKEN
  const conditionScoreStr = formData.get("conditionScore") as string;

  if (!maintenanceId || !resolution || !cameraStatus || !conditionScoreStr) {
    return { error: "Mohon lengkapi semua field yang diwajibkan" };
  }

  try {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id: maintenanceId }
    });

    if (!record) return { error: "Data perbaikan tidak ditemukan" };

    await prisma.$transaction(async (tx) => {
      // 1. Update maintenance record
      await tx.maintenanceRecord.update({
        where: { id: maintenanceId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          description: `${record.description}\n\nSolusi: ${resolution}`,
          replacedComponents: replacedParts || undefined,
          repairCost: actualCostStr ? Number(actualCostStr) : undefined,
        }
      });

      // 2. Update camera
      await tx.camera.update({
        where: { id: record.cameraId },
        data: {
          status: cameraStatus,
          conditionScore: parseInt(conditionScoreStr)
        }
      });
    });

    revalidatePath(`/admin/maintenance`);
    revalidatePath(`/admin/maintenance/${maintenanceId}`);
    revalidatePath(`/admin/inventory`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Resolve maintenance error:", error);
    return { error: "Terjadi kesalahan saat menyelesaikan perbaikan" };
  }
}
