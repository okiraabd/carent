"use client";

import { useState, useTransition } from "react";
import { processCheckout } from "../actions";
import { CheckCircle2, Loader2, Camera, UserSquare2 } from "lucide-react";

export function CheckoutForm({ 
  bookingId, 
  isHighValue,
  customerName
}: { 
  bookingId: string;
  isHighValue: boolean;
  customerName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [depositCollected, setDepositCollected] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isHighValue && !depositCollected) {
      setError("Anda harus mencentang konfirmasi penerimaan Security Deposit terlebih dahulu.");
      return;
    }
    
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("bookingId", bookingId);
    if (depositCollected) {
      formData.append("depositCollected", "true");
    }

    startTransition(async () => {
      const result = await processCheckout(formData);
      if (result.error) {
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Jenis Kartu Identitas</label>
          <select 
            name="cardType" 
            required
            className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
          >
            <option value="KTP">e-KTP</option>
            <option value="SIM">SIM (A/C)</option>
            <option value="PASSPORT">Paspor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Nama Tertera pada Kartu</label>
          <div className="relative">
            <UserSquare2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              name="cardHolderName"
              required
              defaultValue={customerName}
              placeholder="Sesuai KTP/SIM"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Kondisi Fisik Saat Diserahkan</label>
          <div className="relative">
            <Camera className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <textarea 
              name="conditionBefore"
              rows={3}
              placeholder="Catat jika ada lecet/cacat bawaan. Kosongkan jika mulus 100%."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm resize-none"
            />
          </div>
        </div>

        {isHighValue && (
          <label className="flex items-start gap-3 p-4 rounded-lg border border-surface-300 cursor-pointer hover:bg-surface-100/50 transition-colors">
            <input 
              type="checkbox" 
              checked={depositCollected}
              onChange={(e) => setDepositCollected(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
            />
            <div>
              <div className="text-sm font-bold text-text-primary">Saya mengonfirmasi penerimaan Security Deposit</div>
              <div className="text-xs text-text-muted mt-1">Uang senilai Rp 500.000 telah diterima secara fisik/transfer.</div>
            </div>
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 gradient-brand text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 hover:opacity-90 mt-8"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        {isPending ? "Memproses..." : "Selesaikan Serah Terima"}
      </button>
    </form>
  );
}
