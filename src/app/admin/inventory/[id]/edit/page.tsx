import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CameraForm } from "../../_components/camera-form";

export const revalidate = 0;

export default async function EditCameraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const camera = await prisma.camera.findUnique({
    where: { id }
  });

  if (!camera) {
    notFound();
  }

  // Serialize Decimal objects
  const serializedCamera = {
    ...camera,
    purchasePrice: Number(camera.purchasePrice),
    depreciationValue: Number(camera.depreciationValue),
    dailyRate: Number(camera.dailyRate),
    weekendRate: camera.weekendRate ? Number(camera.weekendRate) : null,
    weeklyRate: camera.weeklyRate ? Number(camera.weeklyRate) : null,
  };

  return (
    <div className="p-4">
      <CameraForm initialData={serializedCamera} isEdit />
    </div>
  );
}
