"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PerfilGestorPage() {
  const router = useRouter();
  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("saat_role");
    window.location.href = "/login";
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      <header className="px-4 py-4 border-b border-slate-100">
        <h1 className="font-semibold text-slate-800">Perfil</h1>
      </header>
      <div className="px-4 py-6 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-700">G</div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-lg">Gestora Maria</p>
            <p className="text-slate-500 text-sm">Gestora  EE Professora Maria Aparecida</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full border border-red-200 text-red-600 font-semibold py-3.5 rounded-xl hover:bg-red-50 transition">
          Sair da conta
        </button>
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/gestor/relatorios", label: "Relatrios", icon: "" },
            { href: "/gestor/alunos", label: "Alunos", icon: "" },
            { href: "/gestor/escola", label: "Escola", icon: "" },
            { href: "/gestor/perfil", label: "Perfil", icon: "" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/gestor/perfil" ? "text-blue-600" : "text-slate-400"}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

