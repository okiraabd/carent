import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User as UserIcon, MapPin, Phone, Calendar, CreditCard, Activity, Package, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const revalidate = 0;

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      user: true,
      metrics: true,
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: {
            include: { camera: true }
          }
        }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  const m = profile.metrics;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-12">
      <Link 
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Pelanggan
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold font-heading text-4xl mb-4">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <h1 className="font-heading text-2xl font-bold mb-1">{profile.fullName}</h1>
            <p className="text-text-secondary mb-4">{profile.user.email}</p>

            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${m?.status === 'VIP' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                m?.status === 'REGULAR' ? 'bg-accent-info/10 text-accent-info border border-accent-info/20' :
                m?.status === 'INACTIVE' ? 'bg-accent-error/10 text-accent-error border border-accent-error/20' :
                'bg-surface-200 text-text-secondary border border-surface-300'
              }
            `}>
              {m?.status || 'NEW'} MEMBER
            </span>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold border-b border-surface-200 pb-2 mb-4">Detail Kontak</h3>
            
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-text-muted mt-1" />
              <div>
                <div className="text-xs text-text-muted mb-0.5">Nomor HP</div>
                <div className="font-medium text-sm">{profile.phone || "-"}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-text-muted mt-1" />
              <div>
                <div className="text-xs text-text-muted mb-0.5">Domisili</div>
                <div className="font-medium text-sm">{profile.city || "-"}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-text-muted mt-1" />
              <div>
                <div className="text-xs text-text-muted mb-0.5">Bergabung Sejak</div>
                <div className="font-medium text-sm">{format(profile.createdAt, 'dd MMMM yyyy', { locale: idLocale })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Metrics & History */}
        <div className="md:col-span-2 space-y-6">
          
          <h2 className="font-heading text-xl font-bold">Ringkasan Performa</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-text-secondary mb-2">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Total Transaksi</span>
              </div>
              <div className="text-3xl font-bold font-heading">{m?.totalTransactions || 0}</div>
            </div>
            
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-text-secondary mb-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Total Belanja</span>
              </div>
              <div className="text-2xl font-bold font-heading text-brand-600">
                Rp {Number(m?.totalRevenue || 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-text-secondary mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-sm font-medium">Damage Rate</span>
              </div>
              <div className={`text-3xl font-bold font-heading ${Number(m?.damageRate || 0) > 0 ? 'text-accent-error' : 'text-accent-success'}`}>
                {Number(m?.damageRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>

          <h2 className="font-heading text-xl font-bold mt-8 mb-4">10 Transaksi Terakhir</h2>
          
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-100/50 border-b border-surface-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text-secondary">Booking ID</th>
                    <th className="px-6 py-4 font-semibold text-text-secondary">Kamera</th>
                    <th className="px-6 py-4 font-semibold text-text-secondary">Periode Sewa</th>
                    <th className="px-6 py-4 font-semibold text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {profile.bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/bookings/${booking.id}`} className="font-mono font-medium text-brand-600 hover:underline">
                          {booking.bookingCode}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {booking.items.map((item, idx) => (
                          <div key={item.id} className="font-medium text-text-primary">
                            {item.camera.brand} {item.camera.model}
                            {idx < booking.items.length - 1 && <br />}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {format(booking.startDate, 'dd MMM', { locale: idLocale })} - {format(booking.endDate, 'dd MMM yyyy', { locale: idLocale })}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">{booking.duration} hari</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                          ${booking.status === 'COMPLETED' ? 'bg-accent-success/10 text-accent-success' : 
                            booking.status === 'OVERDUE' ? 'bg-accent-error/10 text-accent-error' :
                            booking.status === 'ACTIVE_RENTAL' ? 'bg-accent-info/10 text-accent-info' :
                            'bg-surface-200 text-text-secondary'
                          }
                        `}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {profile.bookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                        Belum ada riwayat transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
