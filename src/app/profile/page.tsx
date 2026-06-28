import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "./_components/profile-form";
import { ChangePasswordForm } from "./_components/change-password-form";
import Link from "next/link";
import { ArrowLeft, UserCircle } from "lucide-react";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>

        <div className="glass-card overflow-hidden">
          <div className="p-8 border-b border-surface-200 gradient-brand-subtle">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                <UserCircle className="w-10 h-10" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-text-primary">Profil Saya</h1>
                <p className="text-text-secondary mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Informasi Pribadi</h2>
              <p className="text-sm text-text-secondary">
                Lengkapi data diri Anda. Data ini dibutuhkan sebagai syarat melakukan penyewaan kamera demi keamanan aset.
              </p>
            </div>

            <ProfileForm initialData={profile} />

            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
