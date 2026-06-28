"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function AnalyticsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentRange = searchParams.get("range") || "all";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRange = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newRange === "all") {
      params.delete("range");
    } else {
      params.set("range", newRange);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="range-filter" className="text-sm font-medium text-text-secondary">
        Periode Waktu:
      </label>
      <select
        id="range-filter"
        value={currentRange}
        onChange={handleChange}
        className="px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow"
      >
        <option value="30d">30 Hari Terakhir</option>
        <option value="month">Bulan Ini</option>
        <option value="year">Tahun Ini</option>
        <option value="all">Semua Waktu</option>
      </select>
    </div>
  );
}
