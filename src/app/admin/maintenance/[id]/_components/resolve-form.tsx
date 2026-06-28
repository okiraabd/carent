"use client";

import { useState, useTransition } from "react";
import { resolveMaintenance } from "../actions";
import { CheckCircle2, Loader2, Banknote } from "lucide-react";

export function ResolveMaintenanceForm({ 
  maintenanceId,
  estimatedCost
}: { 
  maintenanceId: string;
  estimatedCost?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("maintenanceId", maintenanceId);

    startTransition(async () => {
      const result = await resolveMaintenance(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Tindakan / Solusi yang Dilakukan</label>
        <textarea 
          name="resolution"
          required
          rows={3}
          placeholder="Misal: Lensa dibersihkan dari jamur, kalibrasi ulang fokus."
          className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Komponen yang Diganti (Opsional)</label>
        <input 
          type="text" 
          name="replacedParts"
          placeholder="Misal: Lensa Depan, Tutup Baterai"
          className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Biaya Aktual (Rp)</label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="number" 
              name="actualCost"
              min="0"
              defaultValue={estimatedCost}
              placeholder="Total biaya servis"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Status Kamera Setelah Servis</label>
          <select 
            name="cameraStatus" 
            required
            className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
          >
            <option value="AVAILABLE">Tersedia (Bisa disewakan lagi)</option>
            <option value="BROKEN">Rusak Berat (Tidak bisa disewakan)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Skor Kondisi Baru (1-10)</label>
        <select 
          name="conditionScore" 
          defaultValue="10"
          className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
        >
          <option value="10">10 - Sempurna (Seperti Baru)</option>
          <option value="9">9 - Sangat Baik</option>
          <option value="8">8 - Baik</option>
          <option value="7">7 - Cukup</option>
          <option value="5">5 - Buruk (Cacat permanen)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-text-primary text-surface-50 font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-text-secondary mt-8"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        {isPending ? "Memproses..." : "Selesaikan Perbaikan"}
      </button>
    </form>
  );
}
