"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Activity, AlertCircle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PerfilAlunoPage() {
  const [nome, setNome] = useState("Aluno");
  const [turma, setTurma] = useState("Carregando turma...");
  const [escolaNome, setEscolaNome] = useState("Escola");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single();
        if (profile) setNome(profile.nome);

        const { data: aluno } = await supabase.from("alunos").select("turma, escolas(nome)").eq("user_id", user.id).single();
        if (aluno) {
          setTurma(aluno.turma || "Turma não informada");
          if (aluno.escolas && typeof aluno.escolas === 'object' && 'nome' in aluno.escolas) {
            setEscolaNome((aluno.escolas as any).nome);
          } else {
             setEscolaNome("EE Prof. Eurípedes");
          }
        }
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
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
            {nome.charAt(0)}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-lg">{nome}</p>
            <p className="text-slate-500 text-sm">{turma} • {escolaNome}</p>
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
            { href: "/aluno/dashboard", label: "Painel", icon: Activity },
            { href: "/aluno/atividades", label: "Atividades", icon: FileText },
            { href: "/aluno/tutor", label: "Tutor", icon: User },
            { href: "/aluno/perfil", label: "Perfil", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/aluno/perfil" ? "text-blue-600" : "text-slate-400"}`}>
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
