"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PerfilTutorPage() {
  const router = useRouter();
  function handleLogout() {
    localStorage.removeItem("saat_role");
    router.push("/login");
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      <header className="px-4 py-4 border-b border-slate-100">
        <h1 className="font-semibold text-slate-800">Perfil</h1>
      </header>
      <div className="px-4 py-6 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">C</div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-lg">Carlos Silva</p>
            <p className="text-slate-500 text-sm">Tutor — Acompanhamento escolar</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full border border-red-200 text-red-600 font-semibold py-3.5 rounded-xl hover:bg-red-50 transition">
          Sair da conta
        </button>
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/tutor/painel", label: "Painel", icon: "🏠" },
            { href: "/tutor/alunos", label: "Alunos", icon: "👥" },
            { href: "/tutor/chat", label: "Mensagens", icon: "💬" },
            { href: "/tutor/perfil", label: "Perfil", icon: "👤" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/tutor/perfil" ? "text-blue-600" : "text-slate-400"}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
