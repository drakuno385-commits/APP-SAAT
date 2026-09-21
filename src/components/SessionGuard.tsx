"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SessionGuard() {
  const pathname = usePathname();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const isPublic = pathname === "/login" || pathname === "/cadastro" || pathname === "/";
    if (isPublic) {
      setIsValidating(false);
      return;
    }

    const tabKey = "saat_session_active";
    const isActiveTab = sessionStorage.getItem(tabKey);

    if (!isActiveTab) {
      // Aba nova identificada! Bloqueia a tela e derruba a sessão
      window.location.replace("/");
    } else {
      setIsValidating(false);
    }
  }, [pathname]);

  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return null;
}
