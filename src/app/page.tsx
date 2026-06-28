import Link from "next/link";
import {
  Camera,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Zap,
  Mountain,
  Waves,
  Bike,
  ArrowRight,
} from "lucide-react";

const FEATURED_CAMERAS = [
  {
    name: "GoPro Hero 13 Black",
    image: "🎬",
    price: "Rp 75.000",
    period: "/hari",
    specs: ["5.3K60", "HyperSmooth 7.0", "Waterproof 10m"],
    badge: "Populer",
  },
  {
    name: "DJI Osmo Action 5 Pro",
    image: "📸",
    price: "Rp 85.000",
    period: "/hari",
    specs: ["4K120", "Dual Screen", "Waterproof 20m"],
    badge: "Premium",
  },
  {
    name: "Insta360 X4",
    image: "🌐",
    price: "Rp 100.000",
    period: "/hari",
    specs: ["8K 360°", "AI Editing", "Invisible Selfie Stick"],
    badge: "360°",
  },
];

const STEPS = [
  {
    icon: Camera,
    title: "Pilih Kamera",
    description: "Jelajahi katalog kamera premium kami dan pilih yang sesuai kebutuhanmu",
  },
  {
    icon: Clock,
    title: "Tentukan Jadwal",
    description: "Pilih tanggal sewa dan durasi — harian, akhir pekan, atau mingguan",
  },
  {
    icon: Shield,
    title: "Booking & Bayar",
    description: "Konfirmasi booking dengan pembayaran mudah, unit dijamin tersedia",
  },
  {
    icon: Zap,
    title: "Ambil & Gunakan",
    description: "Ambil unit yang sudah siap, langsung beraksi untuk petualanganmu",
  },
];

const ACTIVITIES = [
  { icon: Mountain, label: "Hiking & Camping", color: "from-emerald-500 to-teal-600" },
  { icon: Bike, label: "Touring & Motovlog", color: "from-orange-500 to-red-600" },
  { icon: Waves, label: "Diving & Snorkeling", color: "from-cyan-500 to-blue-600" },
  { icon: Star, label: "Content Creation", color: "from-purple-500 to-pink-600" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading tracking-tight">
                Carent
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/katalog"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Katalog
              </Link>
              <Link
                href="#cara-sewa"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cara Sewa
              </Link>
              <Link
                href="#aktivitas"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Aktivitas
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white gradient-brand px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-info/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400 mb-8">
              <Zap className="h-3.5 w-3.5" />
              <span>Sewa mudah, kualitas premium</span>
            </div>
          </div>

          <h1 className="animate-fade-in delay-100 font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Abadikan Petualangan
            <br />
            <span className="text-gradient">Tanpa Beli Kamera</span>
          </h1>

          <p className="animate-fade-in delay-200 mx-auto max-w-2xl text-lg sm:text-xl text-text-secondary leading-relaxed mb-10">
            Sewa action camera GoPro, DJI Action, dan Insta360 dengan harga
            terjangkau. Lengkap dengan aksesoris, siap pakai untuk hiking,
            touring, diving, dan konten kreasi.
          </p>

          <div className="animate-fade-in delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/katalog"
              className="group inline-flex items-center gap-2 gradient-brand text-white font-semibold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition-all animate-pulse-glow"
            >
              Lihat Katalog
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#cara-sewa"
              className="inline-flex items-center gap-2 border border-surface-300 text-text-secondary font-medium px-8 py-4 rounded-xl text-lg hover:bg-surface-100 hover:text-text-primary transition-all"
            >
              Cara Sewa
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-in delay-500 mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "50+", label: "Unit Kamera" },
              { value: "1.2K+", label: "Pelanggan" },
              { value: "4.9", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold font-heading text-gradient">
                  {stat.value}
                </div>
                <div className="text-sm text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cameras */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Kamera <span className="text-gradient">Unggulan</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Pilihan kamera action terbaik dengan spesifikasi terkini untuk
              setiap jenis aktivitas outdoor
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURED_CAMERAS.map((camera, idx) => (
              <div
                key={camera.name}
                className="glass-card p-6 flex flex-col animate-fade-in"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{camera.image}</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/20 text-brand-400">
                    {camera.badge}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold mb-3">
                  {camera.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {camera.specs.map((spec) => (
                    <span
                      key={spec}
                      className="text-xs px-2.5 py-1 rounded-md bg-surface-200 text-text-secondary"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t border-surface-200">
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-brand-400">
                      {camera.price}
                    </span>
                    <span className="text-text-muted text-sm mb-0.5">
                      {camera.period}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 text-brand-400 font-medium hover:text-brand-300 transition-colors"
            >
              Lihat semua kamera
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="cara-sewa"
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-surface-50"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Cara <span className="text-gradient">Sewa</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Proses penyewaan yang mudah dan transparan — dari pilih kamera
              hingga siap beraksi
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative text-center">
                  {idx < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-surface-300 to-transparent" />
                  )}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-brand-subtle border border-brand-500/20 mb-5">
                    <Icon className="h-8 w-8 text-brand-400" />
                  </div>
                  <div className="text-xs font-bold text-brand-500 mb-2">
                    LANGKAH {idx + 1}
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section
        id="aktivitas"
        className="relative py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Untuk Setiap <span className="text-gradient">Petualangan</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Apapun aktivitasmu, kami punya kamera yang tepat dengan aksesoris
              yang lengkap
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIVITIES.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.label}
                  className="group glass-card p-6 text-center cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${activity.color} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-heading font-bold">{activity.label}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card p-12 sm:p-16 text-center gradient-mesh">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Siap Beraksi?
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto mb-8 text-lg">
              Daftar sekarang dan mulai sewa kamera impianmu. Proses cepat,
              harga transparan, unit selalu prima.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition-all"
            >
              Mulai Sekarang
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold">Carent</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <Link href="#" className="hover:text-text-primary transition-colors">
                Kebijakan Sewa
              </Link>
              <Link href="#" className="hover:text-text-primary transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="#" className="hover:text-text-primary transition-colors">
                Kontak
              </Link>
            </div>
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} Carent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
