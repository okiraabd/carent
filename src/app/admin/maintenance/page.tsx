import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Settings, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const revalidate = 0;

export default async function MaintenancePage() {
  const records = await prisma.maintenanceRecord.findMany({
    include: { camera: true },
    orderBy: { createdAt: 'desc' }
  });

  const activeCount = records.filter(r => r.status === "IN_PROGRESS").length;
  const completedCount = records.filter(r => r.status === "COMPLETED").length;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Manajemen Perbaikan</h1>
          <p className="text-text-secondary">Kelola daftar kamera yang masuk bengkel atau sedang diservis.</p>
        </div>
        <Link 
          href="/admin/maintenance/create" 
          className="flex items-center gap-2 px-4 py-2 bg-text-primary text-surface-50 rounded-lg font-medium hover:bg-text-secondary transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Catat Perbaikan Baru
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-text-secondary text-sm mb-1">Sedang Servis</div>
          <div className="text-2xl font-bold text-accent-warning">{activeCount} Unit</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-text-secondary text-sm mb-1">Total Selesai</div>
          <div className="text-2xl font-bold text-accent-success">{completedCount} Unit</div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-surface-200 flex justify-between items-center bg-surface-100/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Cari SN atau model..." 
              className="pl-9 pr-4 py-2 rounded-lg bg-white border border-surface-200 focus:border-brand-500 outline-none text-sm w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-100/50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-secondary">Tanggal Masuk</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Kamera</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Kerusakan</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Teknisi / Bengkel</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Estimasi Biaya</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-4 font-semibold text-text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(record.checkDate), 'dd MMM yyyy', { locale: idLocale })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{record.camera.brand} {record.camera.model}</div>
                    <div className="text-xs text-text-muted font-mono">{record.camera.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] truncate">{record.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.technicianName || '-'}</td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {record.repairCost ? `Rp ${Number(record.repairCost).toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {record.status === "IN_PROGRESS" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-accent-warning/10 text-accent-warning border border-accent-warning/20">
                        <Settings className="w-3 h-3" /> Sedang Servis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-accent-success/10 text-accent-success border border-accent-success/20">
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/maintenance/${record.id}`}
                      className="inline-flex items-center justify-center p-2 text-text-muted hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                    Belum ada riwayat perbaikan kamera.
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
