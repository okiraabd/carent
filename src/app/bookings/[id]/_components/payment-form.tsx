"use client";

import { useState, useTransition } from "react";
import { uploadPaymentProof } from "../actions";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

export function PaymentUploadForm({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("bookingId", bookingId);

    startTransition(async () => {
      const result = await uploadPaymentProof(formData);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-text-secondary">Metode Pembayaran</label>
        <select 
          name="paymentMethod" 
          className="w-full px-3 py-2 text-sm rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none"
        >
          <option value="BCA Transfer">BCA Transfer</option>
          <option value="Mandiri Transfer">Mandiri Transfer</option>
          <option value="QRIS">QRIS</option>
          <option value="E-Wallet">Gopay / OVO / Dana</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-text-secondary">Bukti Transfer (Simulasi)</label>
        <div className="border-2 border-dashed border-surface-300 rounded-xl p-6 text-center hover:border-brand-500/50 transition-colors cursor-pointer bg-surface-100/50">
          <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
          <div className="text-sm font-medium text-text-primary mb-1">Klik untuk unggah gambar</div>
          <div className="text-xs text-text-muted">Format: JPG, PNG, PDF (Maks 5MB)</div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 gradient-brand text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {isPending ? "Mengunggah..." : "Konfirmasi Pembayaran"}
      </button>
    </form>
  );
}
