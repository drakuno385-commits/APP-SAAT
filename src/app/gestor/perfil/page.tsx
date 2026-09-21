"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, School, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PerfilGestorPage() {
  const [nome, setNome] = useState("Gestor");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("nome").eq("id", user.id).single();
        if(data) setNome(data.nome);
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
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="px-4 py-4 border-b border-slate-100 bg-white sticky top-0">
        <h1 className="font-semibold text-slate-800">Perfil</h1>
      </header>
      
      <div className="px-4 py-6 flex flex-col gap-5 pb-24">
        <div className="flex flex-col items-center gap-3 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-700">
            {nome.charAt(0)}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-lg">{nome}</p>
            <p className="text-slate-500 text-sm">Gestor(a) • EE Prof. Eurípedes</p>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="w-full bg-white border border-red-200 text-red-600 font-bold py-4 rounded-xl hover:bg-red-50 transition shadow-sm"
        >
          Sair da conta
        </button>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/gestor/relatorios", label: "Relatórios", icon: LayoutDashboard },
            { href: "/gestor/alunos", label: "Alunos", icon: Users },
            { href: "/gestor/escola", label: "Escola", icon: School },
            { href: "/gestor/perfil", label: "Perfil", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/gestor/perfil" ? "text-purple-600" : "text-slate-400"}`}>
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
