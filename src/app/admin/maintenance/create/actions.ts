"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createMaintenanceRecord(formData: FormData) {
  const cameraId = formData.get("cameraId") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as any; // SCHEDULED, REPAIR, REPLACEMENT, INSPECTION
  const technician = formData.get("technician") as string;
  const estimatedCostStr = formData.get("estimatedCost") as string;

  if (!cameraId || !description || !type) {
    return { error: "Mohon lengkapi data perbaikan" };
  }

  let maintenanceId = "";

  try {
    await prisma.$transaction(async (tx) => {
      // Create maintenance record
      const record = await tx.maintenanceRecord.create({
        data: {
          cameraId,
          description,
          type,
          technicianName: technician || undefined,
          status: "IN_PROGRESS",
          checkDate: new Date(),
        }
      });
      
      maintenanceId = record.id;

      // Update camera status
      await tx.camera.update({
        where: { id: cameraId },
        data: { status: "MAINTENANCE" }
      });
    });
    
  } catch (error: any) {
    console.error("Create maintenance error:", error);
    return { error: "Terjadi kesalahan saat mencatat perbaikan" };
  }

  // Redirect after successful transaction, outside of try/catch to avoid catching the redirect error
  revalidatePath(`/admin/maintenance`);
  revalidatePath(`/admin/inventory`);
  redirect(`/admin/maintenance/${maintenanceId}`);
}
