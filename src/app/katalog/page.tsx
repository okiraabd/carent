import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Camera as CameraIcon, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export const revalidate = 0; // Disable caching for now to see live data

export default async function KatalogPage() {
  const cameras = await prisma.camera.findMany({
    orderBy: { brand: 'asc' }
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Katalog <span className="text-gradient">Kamera</span></h1>
        <p className="text-text-secondary">Pilih kamera action terbaik untuk petualanganmu berikutnya.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera, idx) => (
          <div
            key={camera.id}
            className="glass-card p-6 flex flex-col group hover:border-brand-500/30 transition-all"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl gradient-brand-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
                 <CameraIcon className="h-8 w-8 text-brand-400" />
              </div>
              <div className="flex flex-col gap-2 items-end">
                {camera.isHighValue && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-accent-warning/10 border border-accent-warning/20 text-accent-warning">
                    <ShieldAlert className="w-3 h-3" />
                    Premium Deposit
                  </span>
                )}
                {camera.status === "AVAILABLE" ? (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-accent-success/10 border border-accent-success/20 text-accent-success">
                    <CheckCircle2 className="w-3 h-3" />
                    Tersedia
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-200 border border-surface-300 text-text-muted">
                    Sedang Disewa
                  </span>
                )}
              </div>
            </div>
            
            <h3 className="font-heading text-xl font-bold mb-1">
              {camera.brand} {camera.model}
            </h3>
            <div className="text-sm text-text-muted mb-4 font-mono">{camera.code}</div>
            
            <div className="mt-auto pt-4 border-t border-surface-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-brand-400">
                    Rp {Number(camera.dailyRate).toLocaleString("id-ID")}
                  </span>
                  <span className="text-text-muted text-sm">/hari</span>
                </div>
                
                <Link
                  href={`/katalog/${camera.id}`}
                  className="flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors bg-brand-500/10 hover:bg-brand-500/20 px-3 py-2 rounded-lg"
                >
                  Detail <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
