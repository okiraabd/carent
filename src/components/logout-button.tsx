"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  variant?: "ghost" | "default" | "sidebar";
}

export function LogoutButton({ className = "", variant = "default" }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Refresh to clear server components cache and redirect
    router.refresh();
    router.push("/login");
  };

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`flex items-center gap-2 text-xs font-medium text-text-muted hover:text-red-500 transition-colors w-full text-left ${className}`}
      >
        <LogOut className="h-3 w-3" />
        {isLoading ? "Keluar..." : "Keluar dari Akun"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
        variant === "ghost" 
          ? "text-text-secondary hover:text-red-500" 
          : "px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 border border-transparent hover:border-red-100"
      } ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>{isLoading ? "Keluar..." : "Keluar"}</span>
    </button>
  );
}
