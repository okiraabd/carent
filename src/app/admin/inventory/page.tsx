import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit2, ShieldAlert } from "lucide-react";
import { StatusSelect } from "./_components/status-select";

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const cameras = await prisma.camera.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Master Inventory</h1>
          <p className="text-text-secondary">Kelola data kamera dan aset penyewaan.</p>
        </div>
        <Link href="/admin/inventory/create" className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
          Tambah Unit
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-100/50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-secondary">Kode Unit</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Brand & Model</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Tarif Harian</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Kondisi</th>
                <th className="px-6 py-4 font-semibold text-text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {cameras.map((camera) => (
                <tr key={camera.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">{camera.code}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{camera.brand} {camera.model}</div>
                    {camera.isHighValue && (
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-accent-warning mt-1">
                        <ShieldAlert className="w-3 h-3" /> Deposit Tinggi
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    Rp {Number(camera.dailyRate).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <StatusSelect cameraId={camera.id} currentStatus={camera.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-surface-200 overflow-hidden">
                        <div 
                          className={`h-full ${camera.conditionScore >= 8 ? 'bg-accent-success' : camera.conditionScore >= 5 ? 'bg-accent-warning' : 'bg-accent-error'}`} 
                          style={{ width: `${(camera.conditionScore / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-text-muted">{camera.conditionScore}/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/inventory/${camera.id}/edit`} className="inline-flex p-2 text-text-muted hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-500/10">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              
              {cameras.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    Belum ada data inventaris.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
