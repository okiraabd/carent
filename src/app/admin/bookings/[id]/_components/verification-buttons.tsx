"use client";

import { useState, useTransition } from "react";
import { verifyPayment, rejectPayment } from "../actions";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerificationButtons({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setError(null);
    startTransition(async () => {
      const result = await verifyPayment(bookingId);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  async function handleReject() {
    if (!confirm("Apakah Anda yakin ingin menolak pembayaran ini? Status akan diubah menjadi REJECTED.")) return;
    
    setError(null);
    startTransition(async () => {
      const result = await rejectPayment(bookingId);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs mb-3">
          {error}
        </div>
      )}
      
      <button
        onClick={handleVerify}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 gradient-brand text-white font-medium py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        Verifikasi Pembayaran
      </button>
      
      <button
        onClick={handleReject}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-surface-200 text-text-secondary hover:bg-accent-error/10 hover:text-accent-error font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
        Tolak Pembayaran
      </button>
    </div>
  );
}
