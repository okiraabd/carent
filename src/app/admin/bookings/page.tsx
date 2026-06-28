import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { format, parseISO, endOfDay, endOfMonth } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const revalidate = 0;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rentalStartDate = resolvedParams.rentalStartDate as string | undefined;
  const paymentVerifiedDate = resolvedParams.paymentVerifiedDate as string | undefined;

  let whereClause: any = {};
  let filterBadgeText = "";

  if (rentalStartDate) {
    if (rentalStartDate.length === 10) { // Daily yyyy-MM-dd
      const date = parseISO(`${rentalStartDate}T00:00:00Z`);
      whereClause.startDate = {
        gte: date,
        lte: endOfDay(date),
      };
      filterBadgeText = `Mulai Sewa: ${format(date, 'dd MMM yyyy', { locale: idLocale })}`;
    } else if (rentalStartDate.length === 7) { // Monthly yyyy-MM
      const date = parseISO(`${rentalStartDate}-01T00:00:00Z`);
      whereClause.startDate = {
        gte: date,
        lte: endOfMonth(date),
      };
      filterBadgeText = `Bulan Sewa: ${format(date, 'MMM yyyy', { locale: idLocale })}`;
    }
  }

  if (paymentVerifiedDate) {
    let dateFilter = {};
    if (paymentVerifiedDate.length === 10) {
      const date = parseISO(`${paymentVerifiedDate}T00:00:00Z`);
      dateFilter = {
        gte: date,
        lte: endOfDay(date),
      };
      filterBadgeText = `Pendapatan: ${format(date, 'dd MMM yyyy', { locale: idLocale })}`;
    } else if (paymentVerifiedDate.length === 7) {
      const date = parseISO(`${paymentVerifiedDate}-01T00:00:00Z`);
      dateFilter = {
        gte: date,
        lte: endOfMonth(date),
      };
      filterBadgeText = `Pendapatan: ${format(date, 'MMM yyyy', { locale: idLocale })}`;
    }

    whereClause.payments = {
      some: {
        status: "VERIFIED",
        verifiedAt: dateFilter,
      }
    };
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: { 
      items: { include: { camera: true } }, 
      profile: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Manajemen Pesanan</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-text-secondary">Pantau seluruh pemesanan masuk dan verifikasi pembayaran.</p>
            {filterBadgeText && (
              <div className="flex items-center gap-2 bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-xs font-bold border border-brand-500/20">
                <Search className="w-3 h-3" />
                {filterBadgeText}
                <Link href="/admin/bookings" className="ml-1 hover:text-brand-700 transition-colors">
                  <XCircle className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Cari TRX-..." 
            className="pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm w-full sm:w-64"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-100/50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-secondary whitespace-nowrap">Kode Booking</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Pelanggan</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Unit Kamera</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Jadwal Sewa</th>
                <th className="px-6 py-4 font-semibold text-text-secondary whitespace-nowrap">Total DP</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Status</th>
                <th className="px-6 py-4 font-semibold text-text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {bookings.map((booking) => {
                const latestPayment = booking.payments[0];
                const needsVerification = booking.status === "AWAITING_PAYMENT" && latestPayment?.status === "PENDING";
                const camera = booking.items[0]?.camera;

                return (
                  <tr key={booking.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-brand-400">
                      <Link href={`/admin/bookings/${booking.id}`} className="hover:underline">
                        {booking.bookingCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary whitespace-nowrap">{booking.profile.fullName}</div>
                      <div className="text-xs text-text-muted whitespace-nowrap">{booking.profile.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium whitespace-nowrap">{camera?.brand} {camera?.model}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="whitespace-nowrap">
                        {format(new Date(booking.startDate), 'dd MMM', { locale: idLocale })} - {format(new Date(booking.endDate), 'dd MMM yyyy', { locale: idLocale })}
                      </div>
                      <div className="text-xs text-text-muted">{booking.duration} Hari</div>
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      Rp {Number(booking.bookingPaymentAmount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      {needsVerification ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-accent-warning/10 text-accent-warning border border-accent-warning/20 whitespace-nowrap">
                          <Clock className="w-3 h-3" /> Cek Pembayaran
                        </span>
                      ) : booking.status === "AWAITING_PAYMENT" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-200 text-text-muted border border-surface-300 whitespace-nowrap">
                          <Clock className="w-3 h-3" /> Belum Dibayar
                        </span>
                      ) : booking.status === "CONFIRMED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-accent-success/10 text-accent-success border border-accent-success/20 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" /> Terkonfirmasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-200 text-text-secondary border border-surface-300 whitespace-nowrap">
                          {booking.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center justify-center p-2 text-text-muted hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
                    Belum ada data pesanan masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
