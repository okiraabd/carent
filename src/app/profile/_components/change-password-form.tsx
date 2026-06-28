"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "../actions";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Reset the form
        const form = document.getElementById("change-password-form") as HTMLFormElement;
        if (form) form.reset();
      }
    });
  }

  return (
    <form id="change-password-form" action={handleSubmit} className="space-y-6 mt-8 pt-8 border-t border-surface-200">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-text-secondary" />
          Keamanan Akun
        </h2>
        <p className="text-sm text-text-secondary">
          Ubah kata sandi Anda untuk menjaga keamanan akun.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Password berhasil diubah!
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="oldPassword" className="text-sm font-medium text-text-secondary">
            Password Lama <span className="text-accent-error">*</span>
          </label>
          <input
            id="oldPassword"
            name="oldPassword"
            type="password"
            required
            placeholder="Masukkan password saat ini"
            className="w-full sm:w-1/2 px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-text-secondary">
              Password Baru <span className="text-accent-error">*</span>
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-text-secondary">
              Konfirmasi Password Baru <span className="text-accent-error">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="Ketik ulang password baru"
              className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-text-muted"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-surface-200 text-text-primary hover:bg-surface-300 font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-surface-300"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          <span>{isPending ? "Menyimpan..." : "Ubah Password"}</span>
        </button>
      </div>
    </form>
  );
}
