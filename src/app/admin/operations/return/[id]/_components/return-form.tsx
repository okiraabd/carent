"use client";

import { useState, useTransition } from "react";
import { processReturn } from "../actions";
import { CheckCircle2, Loader2, Camera, ShieldAlert, BadgeCheck } from "lucide-react";

export function ReturnForm({ 
  bookingId, 
  isHighValue,
  hasIdentityHold,
  identityCardType,
  hoursLate
}: { 
  bookingId: string;
  isHighValue: boolean;
  hasIdentityHold: boolean;
  identityCardType?: string;
  hoursLate: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [returnedDeposit, setReturnedDeposit] = useState(!isHighValue);
  const [returnedIdentity, setReturnedIdentity] = useState(!hasIdentityHold);
  const [hasPenalty, setHasPenalty] = useState(hoursLate > 1);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isHighValue && !returnedDeposit) {
      setError("Anda harus mengonfirmasi pengembalian Security Deposit.");
      return;
    }
    if (hasIdentityHold && !returnedIdentity) {
      setError("Anda harus mengonfirmasi pengembalian KTP jaminan.");
      return;
    }
    
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("bookingId", bookingId);
    if (returnedDeposit) formData.append("returnedDeposit", "true");
    if (returnedIdentity) formData.append("returnedIdentity", "true");

    startTransition(async () => {
      const result = await processReturn(formData);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-bold mb-4">1. Pengecekan Unit</h4>
          <div className="space-y-4 pl-4 border-l-2 border-surface-200">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Kondisi Fisik Saat Kembali</label>
              <div className="relative">
                <Camera className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <textarea 
                  name="conditionAfter"
                  rows={2}
                  placeholder="Misal: Aman, berfungsi normal. Tidak ada goresan baru."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Nilai Kondisi (1-10)</label>
              <select 
                name="conditionScore" 
                defaultValue="10"
                className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-surface-200 focus:border-brand-500 outline-none text-sm"
              >
                <option value="10">10 - Sempurna (Seperti Baru)</option>
                <option value="9">9 - Sangat Baik (Goresan mikro)</option>
                <option value="8">8 - Baik (Lecet pemakaian wajar)</option>
                <option value="7">7 - Cukup (Ada dent/lecet jelas tapi fungsi normal)</option>
                <option value="5">5 - Buruk (Cacat fisik berat / Perlu service)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            2. Penanganan Denda (Penalty)
            <label className="flex items-center gap-2 ml-auto cursor-pointer">
              <span className="text-sm font-normal text-text-secondary">Ada denda?</span>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${hasPenalty ? 'bg-accent-error' : 'bg-surface-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hasPenalty ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" checked={hasPenalty} onChange={(e) => setHasPenalty(e.target.checked)} className="hidden" />
            </label>
          </h4>
          
          {hasPenalty && (
            <div className="space-y-4 pl-4 border-l-2 border-accent-error/30 p-4 bg-accent-error/5 rounded-r-xl">
              {hoursLate > 1 && (
                <div className="text-xs font-medium text-accent-error mb-2">
                  *Sistem mendeteksi keterlambatan {hoursLate} jam.
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Nominal Denda (Rp)</label>
                  <input 
                    type="number" 
                    name="penaltyAmount"
                    min="0"
                    placeholder="Contoh: 50000"
                    defaultValue={hoursLate > 1 ? hoursLate * 20000 : undefined} // Example default 20k/hr
                    required={hasPenalty}
                    className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-accent-error/20 focus:border-accent-error outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Alasan Denda</label>
                  <input 
                    type="text" 
                    name="penaltyReason"
                    placeholder="Misal: Telat 2 jam / Memori hilang"
                    defaultValue={hoursLate > 1 ? `Terlambat ${hoursLate} jam` : undefined}
                    required={hasPenalty}
                    className="w-full px-4 py-2 rounded-lg bg-surface-100 border border-accent-error/20 focus:border-accent-error outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4">3. Pengembalian Jaminan</h4>
          <div className="space-y-3 pl-4 border-l-2 border-surface-200">
            {hasIdentityHold && (
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${returnedIdentity ? 'bg-accent-success/10 border-accent-success/30' : 'bg-surface-100 border-surface-300 hover:bg-surface-200'}`}>
                <input 
                  type="checkbox" 
                  checked={returnedIdentity}
                  onChange={(e) => setReturnedIdentity(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-surface-300 text-accent-success focus:ring-accent-success"
                />
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    KTP/Identitas ({identityCardType}) telah dikembalikan
                    {returnedIdentity && <BadgeCheck className="w-4 h-4 text-accent-success" />}
                  </div>
                  <div className="text-xs text-text-muted mt-1">Pastikan kartu identitas asli sudah diserahkan kembali ke pelanggan.</div>
                </div>
              </label>
            )}

            {isHighValue && (
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${returnedDeposit ? 'bg-accent-success/10 border-accent-success/30' : 'bg-surface-100 border-surface-300 hover:bg-surface-200'}`}>
                <input 
                  type="checkbox" 
                  checked={returnedDeposit}
                  onChange={(e) => setReturnedDeposit(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-surface-300 text-accent-success focus:ring-accent-success"
                />
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    Security Deposit Rp 500.000 telah dikembalikan
                    {returnedDeposit && <BadgeCheck className="w-4 h-4 text-accent-success" />}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {hasPenalty 
                      ? "Jika ada denda, pastikan deposit dikurangi denda terlebih dahulu sebelum ditransfer kembali." 
                      : "Pastikan uang/transfer telah dikirim kembali ke pelanggan."}
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || (isHighValue && !returnedDeposit) || (hasIdentityHold && !returnedIdentity)}
        className="w-full flex items-center justify-center gap-2 bg-text-primary text-surface-50 font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-text-secondary mt-8"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        {isPending ? "Memproses..." : "Selesaikan Pengembalian"}
      </button>
    </form>
  );
}
