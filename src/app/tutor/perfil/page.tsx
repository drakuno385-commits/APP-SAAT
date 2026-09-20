"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PerfilTutorPage() {
  const [nome, setNome] = useState("Tutor");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single();
        if (profile) setNome(profile.nome);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("saat_session_active");
    window.location.href = "/login";
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      <header className="px-4 py-4 border-b border-slate-100">
        <h1 className="font-semibold text-slate-800">Perfil</h1>
      </header>
      
      <div className="px-4 py-6 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-700">
            {nome.charAt(0)}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-lg">{nome}</p>
            <p className="text-slate-500 text-sm">Tutor Pedagógico</p>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="w-full border border-red-200 text-red-600 font-semibold py-3.5 rounded-xl hover:bg-red-50 transition"
        >
          Sair da conta
        </button>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/tutor/painel", label: "Painel", icon: LayoutDashboard },
            { href: "/tutor/alunos", label: "Alunos", icon: Users },
            { href: "/tutor/chat", label: "Mensagens", icon: MessageSquare },
            { href: "/tutor/perfil", label: "Perfil", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/tutor/perfil" ? "text-indigo-600" : "text-slate-400"}`}>
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
