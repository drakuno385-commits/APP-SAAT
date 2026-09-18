"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona baseado no role salvo no localStorage (demo)
    const role = localStorage.getItem("saat_role");
    if (role === "tutor") router.replace("/tutor/painel");
    else if (role === "gestor") router.replace("/gestor/relatorios");
    else if (role === "aluno") router.replace("/aluno/dashboard");
    else router.replace("/login");
  }, [router]);

  return (
    <div className="app-shell flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl">🎓</span>
        </div>
        <p className="text-slate-500 text-sm">Carregando...</p>
      </div>
    </div>
  );
}
