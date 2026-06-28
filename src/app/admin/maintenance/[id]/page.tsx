import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Settings, Calendar, Banknote } from "lucide-react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ResolveMaintenanceForm } from "./_components/resolve-form";

export const revalidate = 0;

export default async function MaintenanceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const record = await prisma.maintenanceRecord.findUnique({
    where: { id },
    include: { camera: true }
  });

  if (!record) {
    notFound();
  }

  const camera = record.camera;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link
        href="/admin/maintenance"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Perbaikan
      </Link>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-brand-400" />
            Detail Servis Kamera
          </h1>
          <p className="text-text-secondary">Penyelesaian catatan servis dan update kondisi aset.</p>
        </div>
        {record.status === "COMPLETED" ? (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-success/10 text-accent-success border border-accent-success/20 font-bold">
            <CheckCircle2 className="w-5 h-5" /> Selesai
          </span>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-warning/10 text-accent-warning border border-accent-warning/20 font-bold">
            <Settings className="w-5 h-5" /> Sedang Diservis
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 bg-surface-100/50">
            <h3 className="font-bold mb-4">Informasi Aset</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-text-muted mb-1">Kamera</div>
                <div className="font-bold">{camera.brand} {camera.model}</div>
                <div className="font-mono text-xs mt-1 text-text-muted">{camera.code}</div>
              </div>
              <div>
                <div className="text-text-muted mb-1">Skor Kondisi Terakhir</div>
                <div className="font-medium text-accent-warning">{camera.conditionScore}/10</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Laporan Awal Kerusakan</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-text-muted mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Tanggal Masuk</div>
                <div className="font-medium">{format(new Date(record.checkDate), 'dd MMMM yyyy', { locale: idLocale })}</div>
              </div>
              <div>
                <div className="text-text-muted mb-1">Jenis Layanan</div>
                <div className="font-medium">{record.type}</div>
              </div>
              <div>
                <div className="text-text-muted mb-1">Deskripsi</div>
                <div className="font-medium bg-surface-100 p-3 rounded-lg italic">
                  {record.description}
                </div>
              </div>
              <div>
                <div className="text-text-muted mb-1">Teknisi / Bengkel</div>
                <div className="font-medium">{record.technicianName || '-'}</div>
              </div>
              <div>
                <div className="text-text-muted mb-1 flex items-center gap-2"><Banknote className="w-4 h-4"/> Biaya Servis</div>
                <div className="font-medium text-accent-error">
                  {record.repairCost ? `Rp ${Number(record.repairCost).toLocaleString('id-ID')}` : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {record.status === "COMPLETED" ? (
            <div className="glass-card p-6 sm:p-8 h-full border-accent-success/20">
              <h3 className="font-heading text-xl font-bold mb-6 border-b border-surface-200 pb-4">Laporan Penyelesaian</h3>
              <div className="space-y-6 text-sm">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <div className="text-text-muted mb-1">Tanggal Selesai</div>
                    <div className="font-medium">{record.completedAt ? format(new Date(record.completedAt), 'dd MMMM yyyy', { locale: idLocale }) : '-'}</div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-1">Biaya Aktual</div>
                    <div className="font-bold text-lg text-accent-error">
                      {record.repairCost ? `Rp ${Number(record.repairCost).toLocaleString('id-ID')}` : '-'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-text-muted mb-1">Komponen yang Diganti</div>
                  <div className="font-medium p-4 rounded-lg bg-surface-100 border border-surface-200">
                    {record.replacedComponents || '-'}
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-200 flex justify-between items-center">
                  <div>
                    <div className="text-text-muted mb-1">Status Aset Saat Ini</div>
                    <div className="font-bold text-accent-success">{camera.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-muted mb-1">Skor Kondisi Baru</div>
                    <div className="font-bold text-lg">{camera.conditionScore}/10</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 sm:p-8">
              <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4">Selesaikan Perbaikan</h3>
              <ResolveMaintenanceForm maintenanceId={record.id} estimatedCost={Number(record.repairCost)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
