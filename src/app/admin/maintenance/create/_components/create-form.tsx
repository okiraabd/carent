"use client";

import { useState, useTransition } from "react";
import { createMaintenanceRecord } from "../actions";
import { CheckCircle2, Loader2, Camera, AlertTriangle } from "lucide-react";

type CameraItem = {
  id: string;
  brand: string;
  model: string;
  code: string;
  conditionScore: number;
};

export function CreateMaintenanceForm({ cameras }: { cameras: CameraItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createMaintenanceRecord(formData);
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
        <label className="block text-sm font-medium text-text-secondary mb-2">Pilih Kamera</label>
        <div className="relative">
          <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <select 
            name="cameraId" 
            required
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
          >
            <option value="">-- Pilih Kamera yang akan diservis --</option>
            {cameras.map(camera => (
              <option key={camera.id} value={camera.id}>
                {camera.brand} {camera.model} ({camera.code}) - Kondisi: {camera.conditionScore}/10
              </option>
            ))}
          </select>
        </div>
        {cameras.length > 0 && cameras[0].conditionScore < 8 && (
          <div className="mt-2 text-xs text-accent-warning flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Ada unit dengan kondisi di bawah 8 yang butuh perhatian.
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Jenis Pemeliharaan</label>
        <select 
          name="type" 
          required
          className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
        >
          <option value="PREVENTIVE">Perawatan Berkala (Preventive)</option>
          <option value="CORRECTIVE">Perbaikan Kerusakan (Corrective)</option>
          <option value="EMERGENCY">Perbaikan Darurat (Emergency)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Deskripsi Kerusakan / Kendala</label>
        <textarea 
          name="description"
          required
          rows={3}
          placeholder="Jelaskan detail masalahnya. Misal: Lensa berjamur, baterai bocor, dll."
          className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-2">Nama Teknisi / Bengkel</label>
          <input 
            type="text" 
            name="technician"
            placeholder="Misal: Mas Budi / Sony Center"
            className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || cameras.length === 0}
        className="w-full flex items-center justify-center gap-2 gradient-brand text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 hover:opacity-90 mt-8"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        {isPending ? "Menyimpan..." : "Simpan dan Mulai Perbaikan"}
      </button>
    </form>
  );
}
