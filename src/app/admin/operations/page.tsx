import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, LogOut, LogIn, CalendarClock } from "lucide-react";
import { format, isToday, isPast } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const revalidate = 0;

export default async function OperationsDashboardPage() {
  const checkouts = await prisma.booking.findMany({
    where: { 
      status: "CONFIRMED" 
    },
    include: { 
      profile: true,
      items: { include: { camera: true } }
    },
    orderBy: { startDate: 'asc' }
  });

  const returns = await prisma.booking.findMany({
    where: { 
      status: { in: ["ACTIVE_RENTAL", "DUE_TODAY", "OVERDUE"] }
    },
    include: { 
      profile: true,
      items: { include: { camera: true } }
    },
    orderBy: { endDate: 'asc' }
  });

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Dashboard Operasional</h1>
        <p className="text-text-secondary">Pantau jadwal serah terima kamera hari ini.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Jadwal Pengambilan (Checkout) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-surface-200">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Jadwal Ambil <span className="text-text-muted text-base font-normal">({checkouts.length})</span></h2>
            </div>
          </div>

          <div className="space-y-3">
            {checkouts.map((booking) => {
              const camera = booking.items[0]?.camera;
              const scheduledToday = isToday(new Date(booking.startDate));
              
              return (
                <div key={booking.id} className="glass-card p-5 group hover:border-brand-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-sm text-brand-400 mb-1">{booking.bookingCode}</div>
                      <div className="font-bold">{booking.profile.fullName}</div>
                      <div className="text-xs text-text-muted">{booking.profile.phone}</div>
                    </div>
                    {scheduledToday ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-accent-warning/10 text-accent-warning rounded border border-accent-warning/20">Hari Ini</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-1 bg-surface-200 text-text-secondary rounded">{format(new Date(booking.startDate), 'dd MMM yyyy', { locale: idLocale })}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm mb-4">
                    <div className="w-8 h-8 rounded bg-surface-200 flex items-center justify-center shrink-0">📸</div>
                    <div className="font-medium text-text-secondary">{camera?.brand} {camera?.model}</div>
                  </div>
                  
                  <Link 
                    href={`/admin/operations/checkout/${booking.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-200 hover:bg-brand-500/10 hover:text-brand-400 font-medium text-sm transition-colors"
                  >
                    Proses Pengambilan <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
            
            {checkouts.length === 0 && (
              <div className="text-center py-8 text-text-muted text-sm border-2 border-dashed border-surface-200 rounded-xl">
                Tidak ada jadwal pengambilan unit.
              </div>
            )}
          </div>
        </div>

        {/* Jadwal Pengembalian (Return) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-surface-200">
            <div className="w-10 h-10 rounded-lg bg-accent-success/10 text-accent-success flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Jadwal Kembali <span className="text-text-muted text-base font-normal">({returns.length})</span></h2>
            </div>
          </div>

          <div className="space-y-3">
            {returns.map((booking) => {
              const camera = booking.items[0]?.camera;
              const isLate = isPast(new Date(booking.endDate)) && !isToday(new Date(booking.endDate));
              const scheduledToday = isToday(new Date(booking.endDate));
              
              return (
                <div key={booking.id} className={`glass-card p-5 group transition-all ${isLate ? 'border-accent-error/30 bg-accent-error/5' : 'hover:border-accent-success/30'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-sm text-text-secondary mb-1">{booking.bookingCode}</div>
                      <div className="font-bold">{booking.profile.fullName}</div>
                      <div className="text-xs text-text-muted">{booking.profile.phone}</div>
                    </div>
                    {isLate ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-accent-error/10 text-accent-error rounded border border-accent-error/20 flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" /> Terlambat
                      </span>
                    ) : scheduledToday ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-accent-success/10 text-accent-success rounded border border-accent-success/20">Hari Ini</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-1 bg-surface-200 text-text-secondary rounded">{format(new Date(booking.endDate), 'dd MMM yyyy', { locale: idLocale })}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm mb-4">
                    <div className="w-8 h-8 rounded bg-surface-200 flex items-center justify-center shrink-0">📸</div>
                    <div className="font-medium text-text-secondary">{camera?.brand} {camera?.model}</div>
                  </div>
                  
                  <Link 
                    href={`/admin/operations/return/${booking.id}`}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isLate 
                        ? 'bg-accent-error/10 text-accent-error hover:bg-accent-error/20' 
                        : 'bg-surface-200 hover:bg-accent-success/10 hover:text-accent-success'
                    }`}
                  >
                    Proses Pengembalian <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
            
            {returns.length === 0 && (
              <div className="text-center py-8 text-text-muted text-sm border-2 border-dashed border-surface-200 rounded-xl">
                Tidak ada jadwal pengembalian unit.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
