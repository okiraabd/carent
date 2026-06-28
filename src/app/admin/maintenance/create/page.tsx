import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { CreateMaintenanceForm } from "./_components/create-form";

export const revalidate = 0;

export default async function CreateMaintenancePage() {
  // Only cameras that are available or returned damaged can be put into maintenance
  const cameras = await prisma.camera.findMany({
    where: { 
      status: { in: ["AVAILABLE"] } // In a real app, maybe add "RETURNED_DAMAGED" if that status exists, but currently we use AVAILABLE and set conditionScore. 
    },
    select: {
      id: true,
      brand: true,
      model: true,
      code: true,
      conditionScore: true
    },
    orderBy: [
      { conditionScore: 'asc' }, // Prioritize those with lower condition scores
      { brand: 'asc' }
    ]
  });

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Link
        href="/admin/maintenance"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Perbaikan
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
          <Plus className="w-8 h-8 text-brand-400" />
          Catat Perbaikan Baru
        </h1>
        <p className="text-text-secondary">Masukkan kamera ke dalam daftar antrean perbaikan atau servis rutin.</p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <CreateMaintenanceForm cameras={cameras} />
      </div>
    </div>
  );
}
