"use client";

import { useState, useTransition, useMemo } from "react";
import { createBookingDraft } from "../actions";
import { Loader2, Calendar, ShieldAlert, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { differenceInDays, format, addDays } from "date-fns";

export function BookingForm({ camera, profile }: { camera: any; profile: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initialize dates
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 3);
  
  const [startDateStr, setStartDateStr] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [endDateStr, setEndDateStr] = useState(format(nextWeek, 'yyyy-MM-dd'));
  const [notes, setNotes] = useState("");

  const calculations = useMemo(() => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    let duration = differenceInDays(end, start);
    if (duration < 1) duration = 0;

    const subtotal = Number(camera.dailyRate) * duration;
    const dp = subtotal * 0.3;
    const securityDeposit = camera.isHighValue ? 500000 : 200000;

    return {
      duration,
      subtotal,
      dp,
      securityDeposit,
      isValid: duration >= 1,
    };
  }, [startDateStr, endDateStr, camera]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!calculations.isValid) return;
    setError(null);

    const formData = new FormData();
    formData.append("cameraId", camera.id);
    formData.append("startDate", startDateStr);
    formData.append("endDate", endDateStr);
    formData.append("notes", notes);

    startTransition(async () => {
      const result = await createBookingDraft(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push(`/bookings/${result.bookingId}`);
      }
    });
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <form id="booking-form" onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-heading text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              Jadwal Sewa
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Tanggal Pengambilan</label>
                <input
                  type="date"
                  required
                  min={format(today, 'yyyy-MM-dd')}
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Tanggal Pengembalian</label>
                <input
                  type="date"
                  required
                  min={format(addDays(new Date(startDateStr), 1), 'yyyy-MM-dd')}
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>
            
            {calculations.duration === 0 && (
              <p className="text-sm text-accent-warning mt-2">Minimal durasi sewa adalah 1 hari.</p>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t border-surface-200">
            <h3 className="font-heading text-lg font-bold">Catatan Tambahan (Opsional)</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Saya ambil jam 10 pagi, titip settingkan 4K ya."
              className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted resize-none"
            />
          </div>
        </form>

        <div className="glass-card p-6 sm:p-8 bg-surface-100/50">
          <h3 className="font-heading text-lg font-bold mb-4">Informasi Penyewa</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-text-muted mb-1">Nama Lengkap</div>
              <div className="font-medium text-text-primary">{profile.fullName}</div>
            </div>
            <div>
              <div className="text-text-muted mb-1">No. Handphone</div>
              <div className="font-medium text-text-primary">{profile.phone}</div>
            </div>
            <div className="col-span-2">
              <div className="text-text-muted mb-1">Kota / Domisili</div>
              <div className="font-medium text-text-primary">{profile.city || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="glass-card p-6 sticky top-24">
          <h3 className="font-heading text-lg font-bold mb-6 border-b border-surface-200 pb-4">Ringkasan Biaya</h3>
          
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Unit Kamera</span>
              <span className="font-medium text-right">{camera.brand} {camera.model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Durasi Sewa</span>
              <span className="font-medium">{calculations.duration} Hari</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Tarif Harian</span>
              <span className="font-medium">Rp {Number(camera.dailyRate).toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="space-y-4 mb-6 py-4 border-y border-surface-200">
            <div className="flex justify-between items-center font-bold">
              <span>Subtotal Sewa</span>
              <span>Rp {calculations.subtotal.toLocaleString("id-ID")}</span>
            </div>
            
            {camera.isHighValue && (
              <div className="flex items-start gap-2 text-accent-warning bg-accent-warning/10 p-3 rounded-lg text-sm mt-4">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Security Deposit (+ Rp 500rb)</div>
                  <div className="text-xs opacity-90">Dibayarkan terpisah saat pengambilan unit fisik. (Tidak termasuk tagihan ini)</div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-text-secondary font-medium">Down Payment (30%)</span>
              <span className="text-2xl font-bold text-brand-400">
                Rp {calculations.dp.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-xs text-text-muted">Dibayarkan sekarang untuk mengonfirmasi pesanan (Booking Payment).</p>
          </div>

          <button
            type="submit"
            form="booking-form"
            disabled={!calculations.isValid || isPending}
            className="w-full flex items-center justify-center gap-2 gradient-brand text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 hover:opacity-90"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
            {isPending ? "Memproses..." : "Buat Pesanan"}
          </button>
        </div>
      </div>
    </div>
  );
}
