"use client";

import { useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";

export function SubmitButton({ category }: { category: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="inline-flex items-center gap-2 text-sm gradient-brand text-white font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {pending ? "Menyimpan..." : `Simpan Perubahan ${category}`}
    </button>
  );
}
