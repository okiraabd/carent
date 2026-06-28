"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenueChartProps {
  data: {
    date: string;
    total: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] w-full mt-4 bg-surface-100 animate-pulse rounded-lg" />;
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
        <BarChart data={data}>
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => value.split(" ")[1]} // Hanya tampilkan tanggal (misal "05" dari "Jun 05")
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}Jt`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-surface-50 border border-surface-200 p-3 rounded-lg shadow-lg">
                      <p className="font-medium text-text-primary mb-1">{label}</p>
                      <p className="text-brand-500 font-bold">
                        Rp {Number(payload[0].value).toLocaleString('id-ID')}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="total" 
              fill="currentColor" 
              radius={[4, 4, 0, 0]} 
              className="fill-brand-500" 
            />
          </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
