"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Search, ArrowRight, UserCheck, LayoutDashboard, Users, MessageSquare, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TutorDashboardPage() {
  const [nome, setNome] = useState("Tutor");
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState<any[]>([]);

  useEffect(() => {
    async function carregarDados() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("nome").eq("id", user.id).single();
        if (profile) setNome(profile.nome.split(" ")[0]);

        const { data: alunosData } = await supabase
          .from("alunos")
          .select("*, profiles!alunos_user_id_fkey(nome)")
          .eq("tutor_id", user.id).eq("tutor_status", "aprovado");
        
        if (alunosData) setAlunos(alunosData);
      }
      setLoading(false);
    }
    carregarDados();
  }, []);

  const totalAlunos = alunos.length;
  const emRisco = 0;
  const emAtencao = 0;

  return (
    <div className="app-shell min-h-screen bg-slate-50 pb-20">
      <header className="bg-indigo-600 px-4 pt-10 pb-6 rounded-b-3xl shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Olá, {nome}! 👋</h1>
            <p className="text-indigo-100 text-sm mt-1">Aqui está o resumo dos seus alunos.</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl font-bold text-white">{nome.charAt(0)}</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center text-white">
            <span className="text-2xl font-black">{totalAlunos}</span>
            <span className="text-xs font-medium mt-1">Alunos</span>
          </div>
          <div className="bg-yellow-500/20 rounded-2xl p-3 backdrop-blur-sm border border-yellow-500/30 flex flex-col items-center justify-center text-white">
            <span className="text-2xl font-black text-yellow-300">{emAtencao}</span>
            <span className="text-xs font-medium text-yellow-200 mt-1">Atenção</span>
          </div>
          <div className="bg-red-500/20 rounded-2xl p-3 backdrop-blur-sm border border-red-500/30 flex flex-col items-center justify-center text-white">
            <span className="text-2xl font-black text-red-300">{emRisco}</span>
            <span className="text-xs font-medium text-red-200 mt-1">Em Risco</span>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/tutor/alunos" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="text-sm font-semibold text-slate-700">Ver Alunos</span>
          </Link>
          <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <span className="text-sm font-semibold text-slate-400">Mensagens</span>
          </button>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Seus Alunos</h2>
            <Link href="/tutor/alunos" className="text-sm font-bold text-indigo-600 flex items-center gap-1">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-slate-500 py-4">Carregando alunos...</p>
            ) : alunos.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm">
                <UserCheck size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">Nenhum aluno cadastrado com você ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Assim que um aluno te escolher no cadastro, ele aparecerá aqui.</p>
              </div>
            ) : (
              alunos.slice(0, 3).map(aluno => (
                <div key={aluno.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{aluno.profiles?.nome}</h3>
                    <p className="text-xs text-slate-500">{aluno.turma} • RA: {aluno.ra}</p>
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Normal
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
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
            // Simplificado para evitar window reference is not defined during SSR (Hydration mismatch)
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-slate-400 hover:text-indigo-600 focus:text-indigo-600">
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
