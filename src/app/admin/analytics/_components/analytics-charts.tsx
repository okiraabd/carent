"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface ChartData {
  period: string; // e.g., '2026-06-01' or '2026-06'
  label: string;  // e.g., '1 Jun' or 'Jun 26'
  revenue: number;
  bookings: number;
}

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function AnalyticsCharts({ data }: { data: ChartData[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  // Custom tooltip formatter for Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted">
        Tidak ada data pada periode ini
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="space-y-12">
        <div>
          <h3 className="font-heading font-semibold text-lg mb-6">Tren Pendapatan</h3>
          <div className="h-[300px] w-full bg-surface-100/50 animate-pulse rounded-xl" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg mb-6">Volume Transaksi</h3>
          <div className="h-[300px] w-full bg-surface-100/50 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Revenue Line Chart */}
      <div>
        <h3 className="font-heading font-semibold text-lg mb-6">Tren Pendapatan</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <LineChart 
              data={data} 
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `Rp${(value/1000000).toFixed(0)}M`;
                  if (value >= 1000) return `Rp${(value/1000).toFixed(0)}K`;
                  return `Rp${value}`;
                }}
                width={80}
              />
              <Tooltip 
                formatter={(value: any) => [formatRupiah(value as number), "Pendapatan"]}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#FF5A00" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#FF5A00", strokeWidth: 2, stroke: "#fff" }} 
                activeDot={{ 
                  r: 8, 
                  cursor: 'pointer',
                  onClick: (event: any, payload: any) => {
                    if (payload && payload.payload && payload.payload.period) {
                      router.push(`/admin/bookings?paymentVerifiedDate=${payload.payload.period}`);
                    }
                  } 
                }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings Bar Chart */}
      <div>
        <h3 className="font-heading font-semibold text-lg mb-6">Volume Transaksi</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <BarChart 
              data={data} 
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip 
                formatter={(value: any) => [`${value} Transaksi`, "Penyewaan"]}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar 
                dataKey="bookings" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                style={{ cursor: 'pointer' }}
                onClick={(data: any) => {
                  if (data && data.period) {
                    router.push(`/admin/bookings?rentalStartDate=${data.period}`);
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
