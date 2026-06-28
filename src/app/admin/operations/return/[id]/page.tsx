import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import { format, isPast, differenceInHours } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ReturnForm } from "./_components/return-form";

export const revalidate = 0;

export default async function ReturnPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { 
      profile: true,
      items: { include: { camera: true } },
      identityHold: true
    },
  });

  if (!booking || (booking.status !== "ACTIVE_RENTAL" && booking.status !== "OVERDUE" && booking.status !== "COMPLETED")) {
    if (!booking) notFound();
  }

  const camera = booking.items[0]?.camera;
  const isHighValue = camera?.isHighValue || false;
  
  const now = new Date();
  const dueTime = new Date(booking.dueTime);
  const hoursLate = isPast(dueTime) ? differenceInHours(now, dueTime) : 0;
  const isLate = hoursLate > 1;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link
        href="/admin/operations"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Proses Pengembalian Unit</h1>
          <p className="text-text-secondary font-mono">{booking.bookingCode}</p>
        </div>
        {isLate && booking.status !== "COMPLETED" && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-error/10 text-accent-error border border-accent-error/20 font-bold">
            <Calendar className="w-5 h-5" /> Terlambat {hoursLate} Jam
          </span>
        )}
      </div>

      {booking.status === "COMPLETED" ? (
        <div className="glass-card p-12 text-center border-accent-success/20">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent-success/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pengembalian Selesai</h2>
          <p className="text-text-secondary mb-8">Kamera telah diterima kembali dan pesanan ini telah ditutup.</p>
          <Link href="/admin/operations" className="gradient-brand text-white px-6 py-3 rounded-lg font-medium inline-flex">
            Kembali ke Operasional
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 bg-surface-100/50">
              <h3 className="font-bold mb-4">Informasi Sewa</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-text-muted mb-1">Pelanggan</div>
                  <div className="font-bold">{booking.profile.fullName}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{booking.profile.phone}</div>
                </div>
                
                <div className="pt-4 border-t border-surface-200">
                  <div className="text-text-muted mb-1">Kamera</div>
                  <div className="font-bold">{camera?.brand} {camera?.model}</div>
                  <div className="font-mono text-xs mt-1 text-text-muted">{camera?.code}</div>
                </div>

                <div className="pt-4 border-t border-surface-200">
                  <div className="text-text-muted mb-1">Waktu Checkout</div>
                  <div className="font-medium">{booking.checkoutAt ? format(new Date(booking.checkoutAt), 'dd MMM yyyy, HH:mm', { locale: idLocale }) : '-'}</div>
                </div>
                
                <div>
                  <div className="text-text-muted mb-1">Batas Pengembalian</div>
                  <div className="font-medium">{format(new Date(booking.dueTime), 'dd MMM yyyy, HH:mm', { locale: idLocale })}</div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-brand-500/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-400" />
                Catatan Kondisi Awal
              </h3>
              <p className="text-sm bg-surface-100 p-3 rounded-lg italic text-text-secondary">
                {booking.items[0]?.conditionBefore || "Tidak ada catatan cacat awal (Barang mulus)."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card p-6 sm:p-8">
              <ReturnForm 
                bookingId={booking.id} 
                isHighValue={isHighValue}
                hasIdentityHold={booking.identityHold?.status === "HELD"}
                identityCardType={booking.identityHold?.cardType}
                hoursLate={hoursLate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
