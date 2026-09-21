"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, BookOpen, AlertTriangle, TrendingUp, Search, LayoutDashboard, Users, MessageSquare, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ListaAlunosTutorPage() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"ativos" | "pendentes">("ativos");
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("alunos")
        .select("*, profiles!alunos_user_id_fkey(nome)")
        .eq("tutor_id", user.id);
      
      if (data) {
        setAlunos(data);
      }
    }
    setLoading(false);
  }

  async function aprovarAluno(alunoId: string) {
    const supabase = createClient();
    await supabase.from("alunos").update({ tutor_status: "aprovado" }).eq("id", alunoId);
    carregar();
  }

  async function recusarAluno(alunoId: string) {
    const supabase = createClient();
    await supabase.from("alunos").update({ tutor_status: null, tutor_id: null }).eq("id", alunoId);
    carregar();
  }

  const alunosFiltrados = alunos.filter(a => {
    const nome = a.profiles?.nome?.toLowerCase() || "";
    const matchBusca = nome.includes(busca.toLowerCase());
    const status = a.tutor_status || "pendente";
    
    if (filtro === "pendentes") {
      return matchBusca && status === "pendente";
    }
    return matchBusca && status === "aprovado";
  });

  const qtdPendentes = alunos.filter(a => (a.tutor_status || "pendente") === "pendente").length;

  return (
    <div className="app-shell min-h-screen bg-slate-50 pb-20">
      <header className="bg-indigo-600 px-4 pt-6 pb-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/tutor/painel" className="text-white">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-white text-xl font-bold">Gerenciar Alunos</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou RA..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-indigo-700/50 border border-indigo-500 text-white placeholder-indigo-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </header>

      <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFiltro("ativos")}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition shadow-sm ${
            filtro === "ativos" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          Meus Alunos
        </button>
        <button
          onClick={() => setFiltro("pendentes")}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition shadow-sm relative ${
            filtro === "pendentes" ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          Solicitações
          {qtdPendentes > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-md">
              {qtdPendentes}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 pb-6 space-y-3 mt-2">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando alunos...</p>
        ) : alunosFiltrados.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">
              {filtro === "pendentes" ? "Nenhuma solicitação pendente no momento." : "Nenhum aluno ativo encontrado."}
            </p>
          </div>
        ) : (
          alunosFiltrados.map(aluno => (
            <div key={aluno.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{aluno.profiles?.nome}</h3>
                  <p className="text-slate-500 text-sm">{aluno.turma} • RA: {aluno.ra}</p>
                </div>
                {filtro === "ativos" && (
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Ativo
                  </div>
                )}
              </div>
              
              {filtro === "pendentes" ? (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => recusarAluno(aluno.id)}
                    className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-lg text-sm hover:bg-red-100 transition"
                  >
                    Recusar
                  </button>
                  <button 
                    onClick={() => aprovarAluno(aluno.id)}
                    className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg text-sm hover:bg-green-600 transition shadow-sm shadow-green-200"
                  >
                    Aprovar Aluno
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Link 
                    href={`/tutor/aluno/${aluno.id}`}
                    className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-lg text-sm hover:bg-indigo-100 transition text-center"
                  >
                    Ver Perfil do Aluno
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
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
              <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/tutor/alunos" ? "text-indigo-600" : "text-slate-400"}`}>
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
