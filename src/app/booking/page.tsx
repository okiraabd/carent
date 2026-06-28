import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { BookingForm } from "./_components/booking-form";

export const revalidate = 0;

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { camera: string };
}) {
  const { camera: cameraId } = await searchParams;

  if (!cameraId) {
    redirect("/katalog");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/booking?camera=${cameraId}`);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile || !profile.phone || !profile.fullName) {
    return (
      <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-fade-in">
        <div className="max-w-md w-full glass-card p-8 text-center border-accent-warning/20">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-warning/10 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-accent-warning" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-4">Profil Belum Lengkap</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Untuk melakukan penyewaan, Anda diwajibkan melengkapi data diri (Nama, No WhatsApp, dll) demi keamanan operasional kami.
          </p>
          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 gradient-brand text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity w-full"
          >
            Lengkapi Profil Sekarang
          </Link>
          <Link
            href={`/katalog/${cameraId}`}
            className="block text-sm text-text-muted hover:text-text-primary mt-6 transition-colors"
          >
            Batal dan kembali ke detail kamera
          </Link>
        </div>
      </div>
    );
  }

  const camera = await prisma.camera.findUnique({
    where: { id: cameraId },
  });

  if (!camera || camera.status !== "AVAILABLE") {
    return (
      <div className="min-h-screen bg-surface-50 py-12 px-4 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-accent-error mb-2">Kamera Tidak Tersedia</h2>
          <p className="text-text-secondary mb-6">Maaf, unit kamera ini sedang tidak tersedia untuk disewa.</p>
          <Link href="/katalog" className="text-brand-400 font-medium">Kembali ke Katalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/katalog/${cameraId}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Kamera
        </Link>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Formulir <span className="text-gradient">Pemesanan</span></h1>
          <p className="text-text-secondary">Pilih tanggal sewa dan selesaikan pemesanan Anda.</p>
        </div>

        <BookingForm camera={camera} profile={profile} />
      </div>
    </div>
  );
}
