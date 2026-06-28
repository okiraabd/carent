import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Info, ShieldAlert, CalendarClock } from "lucide-react";

export const revalidate = 0;

export default async function KameraDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const camera = await prisma.camera.findUnique({
    where: { id },
  });

  if (!camera) {
    notFound();
  }

  // Define specs if available or fallback to dummy
  const specs = Object.keys(camera.specs as any || {}).length > 0 
    ? (camera.specs as Record<string, any>) 
    : {
        Resolution: "4K 60fps",
        Stabilization: "Yes",
        Waterproof: "Up to 10m",
      };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <Link
        href="/katalog"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Katalog
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image/Visual Section */}
        <div className="space-y-6">
          <div className="aspect-square rounded-2xl glass-card flex items-center justify-center gradient-mesh overflow-hidden relative">
            <span className="text-9xl">📸</span>
            
            {camera.status === "AVAILABLE" ? (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-accent-success/20 border border-accent-success/30 text-accent-success text-sm font-semibold backdrop-blur-md">
                Tersedia
              </div>
            ) : (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-surface-200 border border-surface-300 text-text-muted text-sm font-semibold backdrop-blur-md">
                Sedang Disewa
              </div>
            )}
          </div>
          
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold mb-4 text-lg">Keunggulan Utama</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-text-secondary">
                <Check className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <span>Kondisi unit terawat dengan Condition Score {camera.conditionScore}/10</span>
              </li>
              <li className="flex items-start gap-3 text-text-secondary">
                <Check className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <span>Pengecekan kualitas ketat sebelum disewakan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
          <div className="mb-2 text-brand-400 font-mono text-sm tracking-wider">
            {camera.code}
          </div>
          <h1 className="font-heading text-4xl font-extrabold mb-2">
            {camera.brand} {camera.model}
          </h1>
          <p className="text-text-secondary text-lg mb-8">
            {camera.description || "Action camera premium yang siap menemani setiap petualangan ekstrem Anda dengan kualitas perekaman terbaik."}
          </p>

          <div className="glass-card p-6 mb-8 border-brand-500/20 bg-brand-500/5">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-sm text-text-secondary mb-1">Harga Sewa</div>
                <div className="text-4xl font-bold text-brand-400">
                  Rp {Number(camera.dailyRate).toLocaleString("id-ID")}
                  <span className="text-lg text-text-muted font-normal">/hari</span>
                </div>
              </div>
            </div>
            
            {camera.isHighValue && (
              <div className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-accent-warning/10 border border-accent-warning/20">
                <ShieldAlert className="h-5 w-5 text-accent-warning shrink-0 mt-0.5" />
                <div className="text-sm text-accent-warning">
                  <span className="font-semibold block mb-1">Aset Bernilai Tinggi</span>
                  Penyewaan unit ini mewajibkan Security Deposit tambahan sebesar Rp 500.000 yang akan dikembalikan penuh jika unit kembali dalam kondisi baik.
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="font-heading font-bold mb-4 text-lg">Spesifikasi Teknis</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="glass-card p-4">
                  <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">{key}</div>
                  <div className="font-medium">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-surface-200">
            <Link
              href={`/booking?camera=${camera.id}`}
              className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-xl text-lg transition-all ${
                camera.status === "AVAILABLE" 
                  ? "gradient-brand hover:opacity-90 shadow-lg shadow-brand-500/20" 
                  : "bg-surface-300 cursor-not-allowed opacity-70"
              }`}
            >
              <CalendarClock className="h-5 w-5" />
              {camera.status === "AVAILABLE" ? "Lanjutkan Booking" : "Unit Tidak Tersedia"}
            </Link>
            <p className="text-center text-xs text-text-muted mt-3">
              Anda akan diminta melengkapi profil jika ini adalah penyewaan pertama Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
