import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, AlertCircle, Banknote } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const revalidate = 0;

export default async function BookingsListPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    redirect("/profile");
  }

  const bookings = await prisma.booking.findMany({
    where: { profileId: profile.id },
    include: { items: { include: { camera: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Pemesanan <span className="text-gradient">Saya</span></h1>
            <p className="text-text-secondary">Daftar riwayat penyewaan kamera Anda.</p>
          </div>
          <Link
            href="/katalog"
            className="hidden sm:inline-flex items-center gap-2 gradient-brand text-white font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Sewa Kamera Lagi
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl gradient-brand-subtle flex items-center justify-center mb-6">
              <Banknote className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="font-heading text-xl font-bold mb-2">Belum ada pesanan</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Anda belum memiliki riwayat penyewaan kamera. Temukan kamera action terbaik untuk petualangan Anda!
            </p>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Lihat Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const camera = booking.items[0]?.camera;
              return (
              <Link 
                key={booking.id} 
                href={`/bookings/${booking.id}`}
                className="block glass-card p-6 hover:border-brand-500/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-16 h-16 rounded-xl bg-surface-200 items-center justify-center text-3xl shrink-0">
                      📸
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-heading font-bold text-lg group-hover:text-brand-400 transition-colors">
                          {camera?.brand} {camera?.model}
                        </h3>
                        {booking.status === "AWAITING_PAYMENT" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-warning/10 text-accent-warning border border-accent-warning/20">
                            <Clock className="w-3 h-3" /> Menunggu Pembayaran
                          </span>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-info/10 text-accent-info border border-accent-info/20">
                            <CheckCircle2 className="w-3 h-3" /> Booking Dikonfirmasi
                          </span>
                        )}
                        {booking.status === "ACTIVE_RENTAL" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            Sedang Disewa
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary flex items-center gap-2">
                        <span className="font-mono text-text-muted">{booking.bookingCode}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(booking.startDate), 'dd MMM', { locale: idLocale })} - {format(new Date(booking.endDate), 'dd MMM yyyy', { locale: idLocale })}
                        </span>
                        <span>•</span>
                        <span>{booking.duration} Hari</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-6 sm:border-l border-surface-200">
                    <div className="sm:text-right">
                      <div className="text-xs text-text-muted mb-1">Total Biaya</div>
                      <div className="font-bold text-brand-400">Rp {Number(booking.totalAmount).toLocaleString("id-ID")}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
