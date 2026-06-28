"use client";

import { useState, useTransition } from "react";
import { saveProfile } from "../actions";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await saveProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Optionally redirect to katalog if they came from booking
        setTimeout(() => {
          router.push("/katalog");
        }, 1500);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Profil berhasil disimpan! Mengarahkan ke katalog...
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-text-secondary">
            Nama Lengkap <span className="text-accent-error">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={initialData?.fullName || ""}
            placeholder="Sesuai KTP"
            className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-text-secondary">
            Nomor Telepon / WA <span className="text-accent-error">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={initialData?.phone || ""}
            placeholder="08123456789"
            className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-text-secondary">
            Kota Domisili
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={initialData?.city || ""}
            placeholder="Jakarta"
            className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="profession" className="text-sm font-medium text-text-secondary">
            Profesi / Komunitas
          </label>
          <input
            id="profession"
            name="profession"
            type="text"
            defaultValue={initialData?.profession || ""}
            placeholder="Karyawan Swasta / Anak Motor"
            className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-surface-200 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{isPending ? "Menyimpan..." : "Simpan Profil"}</span>
        </button>
      </div>
    </form>
  );
}
