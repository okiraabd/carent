import Link from "next/link";
import { Camera, LayoutDashboard, Package, Settings, Users, ArrowLeft, ClipboardCheck, BarChart3, User } from "lucide-react";
import { requireAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminUser;
  try {
    // Securely verify admin/manager role via Database
    const { user } = await requireAdmin();
    adminUser = user;
  } catch (error) {
    console.error("AdminLayout Auth Error:", error);
    redirect("/katalog");
  }

  const userEmail = adminUser?.email || "Admin";
  const displayEmail = userEmail.length > 15 ? userEmail.substring(0, 15) + "..." : userEmail;

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-surface-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-surface-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold font-heading tracking-tight">
              Carent Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <Package className="h-4 w-4" />
            Pesanan
          </Link>
          <Link
            href="/admin/operations"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <ClipboardCheck className="h-4 w-4" />
            Operasional
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <Camera className="h-4 w-4" />
            Inventory
          </Link>
          <Link
            href="/admin/maintenance"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Maintenance
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <Users className="h-4 w-4" />
            Pelanggan
          </Link>
          <Link
            href="/admin/rules"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Business Rules
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-100 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Laporan & Analitik
          </Link>
        </nav>

        <div className="p-4 border-t border-surface-200">
          <Link
            href="/katalog"
            className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Web
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-surface-200 glass flex items-center justify-end px-8 shrink-0 gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary px-3 py-2 rounded-lg border border-transparent">
            <User className="h-4 w-4" />
            <span>{displayEmail}</span>
          </div>
          <LogoutButton variant="ghost" />
        </header>

        <div className="p-8 max-w-6xl mx-auto flex-1 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
