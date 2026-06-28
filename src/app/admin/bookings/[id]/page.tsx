import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { VerificationButtons } from "./_components/verification-buttons";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { items: { include: { camera: true } }, profile: true, payments: { orderBy: { createdAt: 'desc' } } },
  });

  if (!booking) {
    notFound();
  }

  const latestPayment = booking.payments[0];
  const needsVerification = booking.status === "AWAITING_PAYMENT" && latestPayment?.status === "PENDING";
  const camera = booking.items[0]?.camera;

  return (
    <div className="animate-fade-in">
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Pesanan
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">
            Pesanan <span className="text-brand-400 font-mono text-2xl">{booking.bookingCode}</span>
          </h1>
          <p className="text-text-secondary">Dibuat pada {format(new Date(booking.createdAt), 'dd MMMM yyyy HH:mm', { locale: idLocale })}</p>
        </div>
        
        {needsVerification ? (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-warning/10 text-accent-warning border border-accent-warning/20 font-bold">
            <Clock className="w-5 h-5" /> Butuh Verifikasi
          </span>
        ) : booking.status === "CONFIRMED" ? (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-success/10 text-accent-success border border-accent-success/20 font-bold">
            <CheckCircle2 className="w-5 h-5" /> Terkonfirmasi
          </span>
        ) : booking.status === "REJECTED_PAYMENT" ? (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-error/10 text-accent-error border border-accent-error/20 font-bold">
            <XCircle className="w-5 h-5" /> Pembayaran Ditolak
          </span>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-200 text-text-secondary font-bold">
            Status: {booking.status}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-8">
            <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4">Data Pelanggan</h3>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-text-muted mb-1">Nama Lengkap</div>
                <div className="font-medium text-lg">{booking.profile.fullName}</div>
              </div>
              <div>
                <div className="text-text-muted mb-1">No WhatsApp</div>
                <div className="font-medium text-lg">{booking.profile.phone}</div>
              </div>
              <div>
                <div className="text-text-muted mb-1">Kota / Domisili</div>
                <div className="font-medium">{booking.profile.city || '-'}</div>
              </div>
              <div>
                <div className="text-text-muted mb-1">Profesi</div>
                <div className="font-medium">{booking.profile.profession || '-'}</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 bg-surface-100/50">
            <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4">Jadwal & Unit</h3>
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex-1">
                <div className="text-text-muted text-sm mb-1">Kamera</div>
                <div className="font-bold text-lg mb-4">{camera?.brand} {camera?.model} <span className="font-mono text-sm text-brand-400">({camera?.code})</span></div>
                
                <div className="text-text-muted text-sm mb-1">Catatan Pelanggan</div>
                <p className="text-sm bg-surface-100 p-3 rounded-lg italic">
                  {booking.notes || "Tidak ada catatan khusus."}
                </p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-surface-200 pb-2">
                  <span className="text-sm text-text-muted">Tanggal Mulai</span>
                  <span className="font-medium">{format(new Date(booking.startDate), 'dd MMM yyyy', { locale: idLocale })}</span>
                </div>
                <div className="flex items-center justify-between border-b border-surface-200 pb-2">
                  <span className="text-sm text-text-muted">Tanggal Selesai</span>
                  <span className="font-medium">{format(new Date(booking.endDate), 'dd MMM yyyy', { locale: idLocale })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Durasi Sewa</span>
                  <span className="font-medium text-brand-400">{booking.duration} Hari</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Rincian Tagihan
            </h3>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Subtotal Sewa</span>
                <span className="font-medium">Rp {Number(booking.subtotal).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">Down Payment (DP)</span>
                <span className="font-bold text-brand-400">Rp {Number(booking.bookingPaymentAmount).toLocaleString("id-ID")}</span>
              </div>
              {camera?.isHighValue && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-surface-300">
                  <span className="text-accent-warning text-xs font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3"/> + Security Deposit Fisik
                  </span>
                  <span className="font-medium text-accent-warning text-xs">Rp {Number(booking.securityDepositAmount).toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            {latestPayment && latestPayment.status === "PENDING" && (
              <div className="pt-6 border-t border-surface-200">
                <div className="text-sm text-text-muted mb-2">Bukti Pembayaran Diunggah:</div>
                <div className="w-full aspect-[3/4] bg-surface-100 rounded-lg flex flex-col items-center justify-center border border-surface-200 mb-4 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mb-2">
                      <CreditCard className="w-8 h-8 text-brand-400" />
                    </div>
                    <span className="font-medium">{booking.paymentMethod}</span>
                    <span className="text-xs text-text-muted mt-1">Klik untuk perbesar foto</span>
                  </div>
                </div>

                {needsVerification && (
                  <VerificationButtons bookingId={booking.id} />
                )}
              </div>
            )}
            
            {latestPayment && latestPayment.status === "VERIFIED" && (
              <div className="pt-6 border-t border-surface-200 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent-success/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-accent-success" />
                </div>
                <div className="font-bold text-accent-success mb-1">Pembayaran Terverifikasi</div>
                <div className="text-xs text-text-secondary">Oleh Admin via {booking.paymentMethod}</div>
              </div>
            )}
            
            {!latestPayment && (
              <div className="pt-6 border-t border-surface-200 text-center">
                <div className="text-sm text-text-muted italic">Pelanggan belum mengunggah bukti pembayaran.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
