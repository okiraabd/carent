import Link from "next/link";
import { Camera, User, ListOrdered } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || "Profil";
  const displayEmail = userEmail.length > 15 ? userEmail.substring(0, 15) + "..." : userEmail;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-surface-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading tracking-tight hidden sm:block">
                Carent
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link href="/katalog" className="text-sm font-medium text-text-primary">
                Katalog
              </Link>
              <Link href="/bookings" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                <ListOrdered className="h-4 w-4" />
                <span className="hidden sm:inline">Pemesanan Saya</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface-100 border border-transparent hover:border-surface-200"
              >
                <User className="h-4 w-4" />
                <span>{displayEmail}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
