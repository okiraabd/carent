import Link from "next/link";
import { Camera } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-mesh items-center justify-center p-12">
        <div className="absolute inset-0 bg-surface-0/30" />
        <div className="relative z-10 max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-brand">
              <Camera className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold font-heading tracking-tight">
              Carent
            </span>
          </Link>
          <h2 className="font-heading text-4xl font-extrabold leading-tight mb-6">
            Abadikan Setiap
            <br />
            <span className="text-gradient">Momen Petualangan</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            Akses kamera action premium tanpa harus membelinya. Sewa GoPro, DJI,
            dan Insta360 dengan harga terjangkau untuk setiap aktivitas outdoor.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "50+", label: "Unit" },
              { value: "1.2K", label: "Pelanggan" },
              { value: "⭐ 4.9", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className="font-heading font-bold text-lg text-brand-400">
                  {stat.value}
                </div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">Carent</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
