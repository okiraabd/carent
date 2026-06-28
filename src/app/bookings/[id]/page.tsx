import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Upload, CheckCircle2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PaymentUploadForm } from "./_components/payment-form";

export const revalidate = 0;

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
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

  const booking = await prisma.booking.findUnique({
    where: { 
      id,
      profileId: profile?.id 
    },
    include: { items: { include: { camera: true } }, payments: true },
  });

  if (!booking) {
    notFound();
  }

  // Check if there's a pending payment
  const pendingPayment = booking.payments.find(p => p.status === "PENDING");
  const camera = booking.items[0]?.camera;

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Pesanan
        </Link>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">Detail <span className="text-gradient">Pesanan</span></h1>
            <p className="font-mono text-text-secondary tracking-wider">{booking.bookingCode}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {booking.status === "AWAITING_PAYMENT" && !pendingPayment && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-warning/10 text-accent-warning border border-accent-warning/20 font-semibold">
                <Clock className="w-5 h-5" /> Menunggu Pembayaran
              </span>
            )}
            {booking.status === "AWAITING_PAYMENT" && pendingPayment && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
                <Clock className="w-5 h-5" /> Sedang Diverifikasi
              </span>
            )}
            {booking.status === "CONFIRMED" && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-success/10 text-accent-success border border-accent-success/20 font-semibold">
                <CheckCircle2 className="w-5 h-5" /> Booking Dikonfirmasi
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 sm:p-8">
              <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4">Informasi Unit</h3>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-surface-100 flex items-center justify-center text-4xl shrink-0">
                  📸
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xl mb-1">{camera?.brand} {camera?.model}</h4>
                  <div className="text-text-secondary font-mono text-sm mb-4">{camera?.code}</div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div>
                      <span className="block text-text-muted text-xs mb-0.5">Mulai</span>
                      <span className="font-medium text-text-primary">{format(new Date(booking.startDate), 'dd MMM yyyy', { locale: idLocale })}</span>
                    </div>
                    <div className="w-8 h-px bg-surface-300"></div>
                    <div>
                      <span className="block text-text-muted text-xs mb-0.5">Selesai</span>
                      <span className="font-medium text-text-primary">{format(new Date(booking.endDate), 'dd MMM yyyy', { locale: idLocale })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 sm:p-8 bg-surface-100/50">
              <h3 className="font-heading text-lg font-bold mb-4">Catatan Pesanan</h3>
              <p className="text-text-secondary text-sm">
                {booking.notes || "Tidak ada catatan khusus."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4">Rincian Pembayaran</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Tarif ({booking.duration} Hari)</span>
                  <span className="font-medium">Rp {Number(booking.subtotal).toLocaleString("id-ID")}</span>
                </div>
                {camera?.isHighValue && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-accent-warning"/> Deposit Fisik</span>
                    <span className="font-medium">Rp {Number(booking.securityDepositAmount).toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6 py-4 border-y border-surface-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Total Tagihan Keseluruhan</span>
                  <span className="font-medium">Rp {(Number(booking.subtotal) + Number(booking.securityDepositAmount)).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-text-secondary font-medium text-sm">Booking Payment (DP)</span>
                  <span className="text-xl font-bold text-brand-400">
                    Rp {Number(booking.bookingPaymentAmount).toLocaleString("id-ID")}
                  </span>
                </div>
                {booking.status === "AWAITING_PAYMENT" && !pendingPayment && (
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Harap segera melakukan pembayaran DP agar pesanan Anda tidak kadaluwarsa.
                  </p>
                )}
              </div>

              {booking.status === "AWAITING_PAYMENT" && !pendingPayment && (
                <div className="pt-6 border-t border-surface-200">
                  <PaymentUploadForm bookingId={booking.id} />
                </div>
              )}

              {pendingPayment && (
                <div className="pt-4 border-t border-surface-200 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">Bukti Terkirim</h4>
                  <p className="text-xs text-text-secondary">Admin sedang memverifikasi pembayaran Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
