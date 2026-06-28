import { prisma } from "@/lib/prisma";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DollarSign, Package, AlertTriangle, Wrench, Users, Camera as CameraIcon, TrendingUp, ClipboardCheck, Search, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "./_components/revenue-chart";

export const revalidate = 0; // Disable cache for dashboard

export default async function AdminDashboardPage() {
  const today = new Date();
  const startOfMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // 1. Fetch Keuangan (Pendapatan bulan ini)
  const paymentsThisMonth = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "VERIFIED",
      verifiedAt: { gte: startOfMonthDate }
    }
  });
  const totalRevenue = Number(paymentsThisMonth._sum.amount || 0);

  // 2. Fetch Operasional
  const activeBookingsCount = await prisma.booking.count({
    where: { status: "ACTIVE_RENTAL" }
  });

  const overdueBookingsCount = await prisma.booking.count({
    where: { status: "OVERDUE" }
  });

  const availableCamerasCount = await prisma.camera.count({
    where: { status: "AVAILABLE" }
  });
  
  const totalCamerasCount = await prisma.camera.count();

  // 3. Fetch Maintenance & Rented Cameras
  const maintenanceCount = await prisma.camera.count({
    where: { status: "MAINTENANCE" }
  });

  const rentedCamerasCount = await prisma.camera.count({
    where: { status: "RENTED" }
  });

  const bookedCamerasCount = await prisma.camera.count({
    where: { status: "BOOKED" }
  });

  const inspectionCamerasCount = await prisma.camera.count({
    where: { status: "INSPECTION" }
  });

  const damagedCamerasCount = await prisma.camera.count({
    where: { status: "DAMAGED" }
  });

  // 4. Fetch Pelanggan Baru (bulan ini)
  const newCustomersCount = await prisma.user.count({
    where: {
      role: "CUSTOMER",
      createdAt: { gte: startOfMonthDate }
    }
  });

  // 5. Data untuk Chart (30 hari terakhir)
  const thirtyDaysAgo = subDays(today, 30);
  const recentPayments = await prisma.payment.findMany({
    where: {
      status: "VERIFIED",
      verifiedAt: { gte: startOfDay(thirtyDaysAgo) }
    },
    select: {
      amount: true,
      verifiedAt: true
    }
  });

  // Agregasi data per hari untuk chart
  const revenueByDay = new Map<string, number>();
  
  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = subDays(today, i);
    revenueByDay.set(format(d, 'MMM dd', { locale: idLocale }), 0);
  }

  recentPayments.forEach(p => {
    if (p.verifiedAt) {
      const dayStr = format(p.verifiedAt, 'MMM dd', { locale: idLocale });
      if (revenueByDay.has(dayStr)) {
        revenueByDay.set(dayStr, revenueByDay.get(dayStr)! + Number(p.amount));
      }
    }
  });

  const chartData = Array.from(revenueByDay.entries()).map(([date, total]) => ({
    date,
    total
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Ringkasan performa bisnis Anda secara real-time.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Pendapatan Bulan Ini</h3>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-1">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-text-muted flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-accent-success" /> Sejak 1 {format(today, 'MMMM', { locale: idLocale })}
          </p>
        </div>

        {/* Active Rentals */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Sedang Disewa</h3>
            <div className="w-10 h-10 rounded-xl bg-accent-info/10 flex items-center justify-center text-accent-info">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-1">
            {activeBookingsCount} <span className="text-sm font-normal text-text-muted">Transaksi</span>
          </div>
          <Link href="/admin/operations" className="text-xs text-brand-500 hover:underline">Lihat operasional &rarr;</Link>
        </div>

        {/* Overdue */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Keterlambatan</h3>
            <div className="w-10 h-10 rounded-xl bg-accent-error/10 flex items-center justify-center text-accent-error">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-1">
            {overdueBookingsCount} <span className="text-sm font-normal text-text-muted">Kamera</span>
          </div>
          <Link href="/admin/operations" className="text-xs text-brand-500 hover:underline">Tindak lanjuti &rarr;</Link>
        </div>

        {/* Assets & Maintenance */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Kamera Tersedia</h3>
            <div className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center text-text-primary">
              <CameraIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-2">
            {availableCamerasCount} <span className="text-sm font-normal text-text-muted">/ {totalCamerasCount}</span>
          </div>
          
          <div className="space-y-1">
            {bookedCamerasCount > 0 && (
              <p className="text-xs text-brand-500 flex items-center gap-1">
                <ClipboardCheck className="w-3 h-3" /> {bookedCamerasCount} telah di-booking
              </p>
            )}

            {rentedCamerasCount > 0 && (
              <p className="text-xs text-accent-info flex items-center gap-1">
                <Package className="w-3 h-3" /> {rentedCamerasCount} sedang disewa
              </p>
            )}

            {inspectionCamerasCount > 0 && (
              <p className="text-xs text-accent-warning flex items-center gap-1">
                <Search className="w-3 h-3" /> {inspectionCamerasCount} dalam pengecekan
              </p>
            )}

            {maintenanceCount > 0 && (
              <Link href="/admin/maintenance" className="text-xs text-accent-warning hover:underline flex items-center gap-1">
                <Wrench className="w-3 h-3" /> {maintenanceCount} sedang diservis
              </Link>
            )}

            {damagedCamerasCount > 0 && (
              <p className="text-xs text-accent-error flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {damagedCamerasCount} rusak
              </p>
            )}

            {rentedCamerasCount === 0 && maintenanceCount === 0 && bookedCamerasCount === 0 && inspectionCamerasCount === 0 && damagedCamerasCount === 0 && (
              <p className="text-xs text-accent-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Semua unit sehat & tersedia
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-heading text-lg font-bold mb-6">Tren Pendapatan (30 Hari Terakhir)</h2>
          <RevenueChart data={chartData} />
        </div>

        {/* Quick Actions / Summary */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Pelanggan & CRM</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{newCustomersCount}</div>
                <div className="text-sm text-text-secondary">Pelanggan baru bulan ini</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-brand-500/5 to-transparent">
            <h2 className="font-heading text-lg font-bold mb-4">Akses Cepat</h2>
            <div className="space-y-3">
              <Link href="/admin/bookings" className="flex items-center justify-between p-3 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors">
                <span className="font-medium text-sm">Semua Transaksi</span>
                <span className="text-brand-500 text-sm">&rarr;</span>
              </Link>
              <Link href="/admin/operations" className="flex items-center justify-between p-3 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors">
                <span className="font-medium text-sm">Kasir & Operasional</span>
                <span className="text-brand-500 text-sm">&rarr;</span>
              </Link>
              <Link href="/admin/inventory" className="flex items-center justify-between p-3 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors">
                <span className="font-medium text-sm">Katalog Kamera</span>
                <span className="text-brand-500 text-sm">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
