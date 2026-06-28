"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Camera as CameraIcon } from "lucide-react";
import Link from "next/link";
import { createCamera, updateCamera } from "../actions";

interface CameraFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function CameraForm({ initialData, isEdit = false }: CameraFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = isEdit 
        ? await updateCamera(initialData.id, formData)
        : await createCamera(formData);

      if (res.error) {
        setError(res.error);
      } else {
        router.push("/admin/inventory");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in">
      <Link 
        href="/admin/inventory"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Inventory
      </Link>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-surface-200 pb-4">
          <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
            <CameraIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">{isEdit ? "Edit Kamera" : "Tambah Kamera Baru"}</h1>
            <p className="text-sm text-text-secondary">Lengkapi detail spesifikasi dan harga sewa unit.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-accent-error bg-accent-error/10 border border-accent-error/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Kode Unit *</label>
              <input 
                type="text" 
                name="code" 
                defaultValue={initialData?.code || ""}
                required 
                className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                placeholder="Contoh: CAM-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Brand *</label>
              <input 
                type="text" 
                name="brand" 
                defaultValue={initialData?.brand || ""}
                required 
                className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                placeholder="Contoh: Sony"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Model *</label>
              <input 
                type="text" 
                name="model" 
                defaultValue={initialData?.model || ""}
                required 
                className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                placeholder="Contoh: Alpha A7 IV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Tarif Harian (Rp) *</label>
              <input 
                type="number" 
                name="dailyRate" 
                defaultValue={initialData?.dailyRate || ""}
                required 
                min={0}
                className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Tarif Weekend (Rp)</label>
              <input 
                type="number" 
                name="weekendRate" 
                defaultValue={initialData?.weekendRate || ""}
                min={0}
                className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Kondisi (1-10)</label>
              <input 
                type="number" 
                name="conditionScore" 
                defaultValue={initialData?.conditionScore || 10}
                min={1} max={10}
                className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Lokasi Penyimpanan</label>
            <input 
              type="text" 
              name="storageLocation" 
              defaultValue={initialData?.storageLocation || ""}
              className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder="Contoh: Rak A-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Deskripsi / Spesifikasi Singkat</label>
            <textarea 
              name="description" 
              rows={4}
              defaultValue={initialData?.description || ""}
              className="w-full px-4 py-2 bg-surface-100 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
              placeholder="Deskripsi tambahan mengenai kamera ini..."
            />
          </div>

          <div className="flex items-center gap-2 p-4 bg-surface-100 border border-surface-200 rounded-lg">
            <input 
              type="checkbox" 
              id="isHighValue" 
              name="isHighValue" 
              value="true"
              defaultChecked={initialData?.isHighValue}
              className="w-4 h-4 text-brand-500 rounded border-surface-300 focus:ring-brand-500"
            />
            <label htmlFor="isHighValue" className="text-sm font-medium text-text-primary">
              Tandai sebagai Barang Bernilai Tinggi (Deposit Khusus)
            </label>
          </div>

          <div className="pt-4 border-t border-surface-200 flex justify-end">
            <button 
              type="submit" 
              disabled={isPending}
              className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan Kamera Baru"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
