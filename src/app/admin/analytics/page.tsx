import { prisma } from "@/lib/prisma";
import { format, parseISO, subDays, startOfMonth, startOfYear, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  DollarSign,
  Package,
  Camera as CameraIcon,
  CheckCircle2,
  TrendingUp,
  CalendarDays,
  Snowflake,
} from "lucide-react";
import { AnalyticsFilter } from "./_components/analytics-filter";
import { AnalyticsCharts, ChartData } from "./_components/analytics-charts";

export const revalidate = 0; // Disable cache for analytics

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const range = (resolvedParams.range as string) || "all";

  // Determine Date Filter
  const now = new Date();
  let startDate: Date | undefined;
  
  if (range === "30d") {
    startDate = subDays(now, 30);
  } else if (range === "month") {
    startDate = startOfMonth(now);
  } else if (range === "year") {
    startDate = startOfYear(now);
  }

  const dateFilter = startDate ? { gte: startDate } : undefined;

  // =========================================================
  // BAGIAN 1: PERTANYAAN "BERAPA" (KPI Cards)
  // =========================================================

  // 1. Total Pendapatan
  const verifiedPayments = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "VERIFIED",
      type: { in: ["BOOKING_PAYMENT", "PENALTY", "SETTLEMENT"] },
      booking: { status: { not: "CANCELLED" } },
      ...(dateFilter && { verifiedAt: dateFilter }),
    },
  });
  const totalRevenue = Number(verifiedPayments._sum.amount || 0);

  // 2. Kamera Tersedia (Sifatnya snapshot current, tidak terpengaruh filter)
  const availableCamerasCount = await prisma.camera.count({
    where: { status: "AVAILABLE" },
  });

  // 3. Total Kamera
  const totalCamerasCount = await prisma.camera.count();

  // 4. Total Transaksi Selesai
  const completedBookingsCount = await prisma.booking.count({
    where: { 
      status: "COMPLETED",
      ...(dateFilter && { createdAt: dateFilter }),
    },
  });

  // =========================================================
  // BAGIAN 2: PERTANYAAN "KAPAN PUNCAKNYA" & CHART DATA
  // =========================================================

  const payments = await prisma.payment.findMany({
    where: { 
      status: "VERIFIED",
      type: { in: ["BOOKING_PAYMENT", "PENALTY", "SETTLEMENT"] },
      booking: { status: { not: "CANCELLED" } },
      verifiedAt: { not: null, ...(dateFilter && dateFilter) } 
    },
    select: { amount: true, verifiedAt: true },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      ...(dateFilter && { startDate: dateFilter })
    },
    select: { startDate: true },
  });

  // Top Cameras Calculation
  const bookingItems = await prisma.bookingItem.findMany({
    where: {
      booking: dateFilter ? { startDate: dateFilter } : undefined,
    },
    include: {
      camera: true,
    },
  });

  const cameraPopularity = new Map<string, { brand: string; model: string; count: number }>();
  bookingItems.forEach((item) => {
    const key = `${item.camera.brand} ${item.camera.model}`;
    const current = cameraPopularity.get(key);
    if (current) {
      current.count += 1;
    } else {
      cameraPopularity.set(key, { brand: item.camera.brand, model: item.camera.model, count: 1 });
    }
  });

  const topCameras = Array.from(cameraPopularity.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const isDaily = range === "30d" || range === "month";
  const groupFormat = isDaily ? "yyyy-MM-dd" : "yyyy-MM";

  // Peak Analysis
  const revenueByMonth = new Map<string, number>();
  payments.forEach((p) => {
    if (p.verifiedAt) {
      const monthKey = format(p.verifiedAt, groupFormat);
      const current = revenueByMonth.get(monthKey) || 0;
      revenueByMonth.set(monthKey, current + Number(p.amount));
    }
  });

  let peakRevenueMonthKey = "";
  let peakRevenueValue = 0;
  revenueByMonth.forEach((val, key) => {
    if (val > peakRevenueValue) {
      peakRevenueValue = val;
      peakRevenueMonthKey = key;
    }
  });

  const bookingsByMonth = new Map<string, number>();
  bookings.forEach((b) => {
    const monthKey = format(b.startDate, groupFormat);
    const current = bookingsByMonth.get(monthKey) || 0;
    bookingsByMonth.set(monthKey, current + 1);
  });

  let peakBookingMonthKey = "";
  let peakBookingValue = -1;
  let lowBookingMonthKey = "";
  let lowBookingValue = Infinity;

  if (bookingsByMonth.size > 0) {
    bookingsByMonth.forEach((val, key) => {
      if (val > peakBookingValue) {
        peakBookingValue = val;
        peakBookingMonthKey = key;
      }
      if (val < lowBookingValue) {
        lowBookingValue = val;
        lowBookingMonthKey = key;
      }
    });
  } else {
    peakBookingValue = 0;
    lowBookingValue = 0;
  }

  const formatMonth = (dateStr: string) => {
    if (!dateStr) return "Belum ada data";
    if (dateStr.length === 10) {
      // isDaily format yyyy-MM-dd
      const date = parseISO(`${dateStr}T00:00:00Z`);
      return format(date, "dd MMMM yyyy", { locale: idLocale });
    } else {
      // isMonthly format yyyy-MM
      const date = parseISO(`${dateStr}-01T00:00:00Z`);
      return format(date, "MMMM yyyy", { locale: idLocale });
    }
  };

  // =========================================================
  // PREPARE CHART DATA
  // =========================================================
  const chartData: ChartData[] = [];
  
  if (range === "30d" || range === "month") {
    // Tampilkan per hari
    const start = range === "month" ? startOfMonth(now) : subDays(now, 30);
    const days = eachDayOfInterval({ start, end: now });
    
    days.forEach(day => {
      const dayPayments = payments.filter(p => p.verifiedAt && isSameDay(p.verifiedAt, day));
      const dayBookings = bookings.filter(b => isSameDay(b.startDate, day));
      
      chartData.push({
        period: format(day, "yyyy-MM-dd"),
        label: format(day, "dd MMM", { locale: idLocale }),
        revenue: dayPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        bookings: dayBookings.length,
      });
    });
  } else {
    // Tampilkan per bulan
    const start = range === "year" ? startOfYear(now) : (bookings.length > 0 ? bookings[0].startDate : startOfYear(now)); // default to start of year if no data for 'all' to avoid error
    // If 'all' and we have payments/bookings, find the earliest date
    let earliestDate = start;
    if (range === "all") {
        let minDate = new Date();
        if (bookings.length > 0) {
           bookings.forEach(b => { if(b.startDate < minDate) minDate = b.startDate; });
        }
        if (payments.length > 0) {
            payments.forEach(p => { if(p.verifiedAt && p.verifiedAt < minDate) minDate = p.verifiedAt; });
        }
        earliestDate = startOfMonth(minDate);
    }

    const months = eachMonthOfInterval({ start: earliestDate, end: now });
    
    months.forEach(month => {
      const monthPayments = payments.filter(p => p.verifiedAt && isSameMonth(p.verifiedAt, month));
      const monthBookings = bookings.filter(b => isSameMonth(b.startDate, month));
      
      chartData.push({
        period: format(month, "yyyy-MM"),
        label: format(month, "MMM yyyy", { locale: idLocale }),
        revenue: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        bookings: monthBookings.length,
      });
    });
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">
            Laporan & Analitik Bisnis
          </h1>
          <p className="text-text-secondary">
            Insight bisnis komprehensif dari seluruh data yang tercatat dalam sistem.
          </p>
        </div>
        <AnalyticsFilter />
      </div>

      {/* Bagian 1: Berapa */}
      <h2 className="text-xl font-heading font-semibold mb-4">Total & Akumulasi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Pendapatan Kotor</h3>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-1">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-text-muted">Periode terpilih</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-accent-info">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Transaksi Selesai</h3>
            <div className="w-10 h-10 rounded-xl bg-accent-info/10 flex items-center justify-center text-accent-info">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-1">
            {completedBookingsCount} <span className="text-sm font-normal text-text-muted">Booking</span>
          </div>
          <p className="text-xs text-text-muted">Periode terpilih</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-surface-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Kamera Tersedia</h3>
            <div className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center text-text-primary">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-1">
            {availableCamerasCount} <span className="text-sm font-normal text-text-muted">Unit</span>
          </div>
          <p className="text-xs text-text-muted">Status: AVAILABLE (Saat ini)</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-surface-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-secondary">Total Inventaris</h3>
            <div className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center text-text-primary">
              <CameraIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading mb-1">
            {totalCamerasCount} <span className="text-sm font-normal text-text-muted">Kamera</span>
          </div>
          <p className="text-xs text-text-muted">Seluruh unit dalam sistem</p>
        </div>
      </div>

      {/* Bagian 2: Chart & Peak Analysis */}
      <div className="mb-12">
        <AnalyticsCharts data={chartData} />
      </div>

      <h2 className="text-xl font-heading font-semibold mb-4">Analisis Tren {isDaily ? "Harian" : "Bulanan"} (Kapan Puncak Terjadi)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Peak Revenue */}
        <div className="glass-card p-6 bg-gradient-to-br from-brand-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Puncak Pendapatan</h3>
              <p className="text-sm text-text-secondary">{isDaily ? "Tanggal" : "Bulan"} dengan revenue tertinggi</p>
            </div>
          </div>
          
          <div className="bg-surface-100 p-4 rounded-xl">
            <div className="text-sm text-text-muted mb-1">Periode (Pada Filter)</div>
            <div className="text-xl font-bold mb-3">{formatMonth(peakRevenueMonthKey)}</div>
            
            <div className="text-sm text-text-muted mb-1">Total Pendapatan</div>
            <div className="text-xl font-bold text-brand-500">
              Rp {peakRevenueValue.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Peak Bookings */}
        <div className="glass-card p-6 bg-gradient-to-br from-accent-info/5 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent-info/10 flex items-center justify-center text-accent-info">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Puncak Keramaian</h3>
              <p className="text-sm text-text-secondary">{isDaily ? "Tanggal" : "Bulan"} dengan booking terbanyak</p>
            </div>
          </div>
          
          <div className="bg-surface-100 p-4 rounded-xl">
            <div className="text-sm text-text-muted mb-1">Periode (Pada Filter)</div>
            <div className="text-xl font-bold mb-3">{formatMonth(peakBookingMonthKey)}</div>
            
            <div className="text-sm text-text-muted mb-1">Total Transaksi</div>
            <div className="text-xl font-bold text-accent-info">
              {peakBookingValue} <span className="text-sm font-normal text-text-muted">Penyewaan</span>
            </div>
          </div>
        </div>

        {/* Lowest Bookings (Peak Availability) */}
        <div className="glass-card p-6 bg-gradient-to-br from-surface-300/20 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center text-text-primary">
              <Snowflake className="w-6 h-6 text-accent-info" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Ketersediaan Terbanyak</h3>
              <p className="text-sm text-text-secondary">Periode paling sepi (Low Season)</p>
            </div>
          </div>
          
          <div className="bg-surface-100 p-4 rounded-xl border border-surface-200">
            <div className="text-sm text-text-muted mb-1">Periode (Pada Filter)</div>
            <div className="text-xl font-bold mb-3">{formatMonth(lowBookingMonthKey)}</div>
            
            <div className="text-sm text-text-muted mb-1">Total Transaksi</div>
            <div className="text-xl font-bold text-text-primary">
              {lowBookingValue} <span className="text-sm font-normal text-text-muted">Penyewaan</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-surface-200 text-xs text-text-secondary italic">
              💡 Saran: Rencanakan maintenance unit besar-besaran atau promo diskon pada periode ini.
            </div>
          </div>
        </div>

      </div>

      <h2 className="text-xl font-heading font-semibold mb-4 mt-12">Produk & Performa</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Cameras Card */}
        <div className="glass-card p-6 bg-gradient-to-br from-surface-300/10 to-transparent lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
              <CameraIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Kamera Favorit</h3>
              <p className="text-sm text-text-secondary">Paling sering disewa</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {topCameras.length > 0 ? topCameras.map((cam, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-500 w-6">#{idx + 1}</span>
                  <div>
                    <div className="font-medium text-sm">{cam.model}</div>
                    <div className="text-xs text-text-secondary">{cam.brand}</div>
                  </div>
                </div>
                <div className="font-bold">
                  {cam.count} <span className="text-xs font-normal text-text-muted">x</span>
                </div>
              </div>
            )) : (
              <div className="text-center text-text-muted py-4 text-sm">Belum ada data penyewaan</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
