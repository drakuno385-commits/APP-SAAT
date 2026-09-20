"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ListaAlunosTutorPage() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "risco" | "atencao">("todos");
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("alunos")
          .select("*, profiles(nome)")
          .eq("tutor_id", user.id);
        if (data) setAlunos(data);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  const alunosFiltrados = alunos.filter(a => {
    const nome = a.profiles?.nome?.toLowerCase() || "";
    const matchBusca = nome.includes(busca.toLowerCase());
    // Por enquanto, não temos regra de risco complexa na DB ainda
    return matchBusca;
  });

  return (
    <div className="app-shell min-h-screen bg-slate-50 pb-20">
      <header className="bg-indigo-600 px-4 pt-6 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/tutor/painel" className="text-white">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-white text-xl font-bold">Meus Alunos</h1>
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
        {["todos", "risco", "atencao"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${
              filtro === f 
                ? "bg-indigo-600 text-white" 
                : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {f === "todos" ? "Todos" : f === "risco" ? "🔴 Risco" : "🟡 Atenção"}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 space-y-3 mt-2">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando alunos...</p>
        ) : alunosFiltrados.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">Nenhum aluno encontrado.</p>
          </div>
        ) : (
          alunosFiltrados.map(aluno => (
            <div key={aluno.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{aluno.profiles?.nome}</h3>
                <p className="text-slate-500 text-sm">{aluno.turma} • RA: {aluno.matricula}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Trabalha: {aluno.trabalha ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                Normal
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
