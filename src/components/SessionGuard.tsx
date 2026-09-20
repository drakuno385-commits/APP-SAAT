"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // Rotas públicas que não precisam de verificação de aba
    if (pathname === "/login" || pathname === "/cadastro" || pathname === "/") return;

    const tabKey = "saat_session_active";
    const isActiveTab = sessionStorage.getItem(tabKey);

    if (!isActiveTab) {
      // Se não tem a marcação no sessionStorage (memória volátil da aba), é porque abriu em nova guia ou o navegador fechou.
      // Desloga o usuário imediatamente.
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        window.location.href = "/login";
      });
    }
  }, [pathname]);

  return null;
}
