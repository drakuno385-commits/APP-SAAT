"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SessionGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const isPublic = pathname === "/login" || pathname === "/cadastro" || pathname === "/";
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isPublic) {
        // Not logged in, trying to access private route
        window.location.href = "/login";
        return;
      }

      if (session && isPublic) {
        // Logged in, trying to access public route
        const role = session.user.user_metadata?.role || "aluno";
        const dest = role === "tutor" ? "/tutor/painel" : role === "gestor" ? "/gestor/relatorios" : "/aluno/dashboard";
        window.location.href = dest;
        return;
      }

      // If logged in, check role matching
      if (session && !isPublic) {
        const role = session.user.user_metadata?.role || "aluno";
        if (role === "aluno" && !pathname.startsWith("/aluno")) {
            window.location.href = "/aluno/dashboard";
            return;
        }
        if (role === "tutor" && !pathname.startsWith("/tutor")) {
            window.location.href = "/tutor/painel";
            return;
        }
        if (role === "gestor" && !pathname.startsWith("/gestor")) {
            window.location.href = "/gestor/relatorios";
            return;
        }
      }

      setIsValidating(false);
    });
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