import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Search, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const profiles = await prisma.profile.findMany({
    where: {
      user: {
        role: "CUSTOMER"
      }
    },
    include: {
      user: true,
      metrics: true,
      bookings: {
        where: {
          status: {
            notIn: ['DRAFT', 'CANCELLED', 'REJECTED_PAYMENT']
          }
        },
        select: {
          id: true,
          totalAmount: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Pelanggan</h1>
          <p className="text-text-secondary">Kelola daftar pelanggan dan riwayat penyewaan mereka.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-surface-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau nomor HP..." 
              className="w-full pl-9 pr-4 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
          <div className="text-sm font-medium text-text-muted">
            Total {profiles.length} pelanggan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-100/50 border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-secondary">Pelanggan</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Kontak</th>
                <th className="px-6 py-4 font-semibold text-text-secondary">Status Member</th>
                <th className="px-6 py-4 font-semibold text-text-secondary text-right">Total Transaksi</th>
                <th className="px-6 py-4 font-semibold text-text-secondary text-right">Total Dibelanjakan</th>
                <th className="px-6 py-4 font-semibold text-text-secondary text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold font-heading">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">{profile.fullName}</div>
                        <div className="text-xs text-text-muted">Bergabung {format(profile.createdAt, 'MMM yyyy', { locale: idLocale })}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{profile.phone}</div>
                    <div className="text-xs text-text-muted">{profile.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${profile.metrics?.status === 'VIP' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                        profile.metrics?.status === 'REGULAR' ? 'bg-accent-info/10 text-accent-info border border-accent-info/20' :
                        profile.metrics?.status === 'INACTIVE' ? 'bg-accent-error/10 text-accent-error border border-accent-error/20' :
                        'bg-surface-200 text-text-secondary border border-surface-300'
                      }
                    `}>
                      {profile.metrics?.status || 'NEW'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {profile.bookings.length}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-brand-600">
                    Rp {Number(profile.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0)).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link 
                      href={`/admin/users/${profile.id}`}
                      className="inline-flex items-center justify-center p-2 text-text-muted hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-colors"
                      title="Lihat Profil"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 text-text-muted mb-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-text-secondary">Belum ada pelanggan yang mendaftar.</p>
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
