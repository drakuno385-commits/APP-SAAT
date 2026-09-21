"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function AlunoCard({ aluno }: { aluno: any }) {
  const getRiscoConfig = (media: number, faltas: number) => {
    let pontos = 0;
    if (faltas > 5) pontos++;
    if (media < 6) pontos++;
    
    if (pontos >= 2) return { bg: "#fee2e2", color: "#dc2626", label: "Risco", emoji: "🔴" };
    if (pontos === 1) return { bg: "#fef3c7", color: "#d97706", label: "Atenção", emoji: "🟡" };
    return { bg: "#dcfce7", color: "#16a34a", label: "Normal", emoji: "🟢" };
  };

  const faltasTotal = aluno.faltas?.[0]?.count || 0;
  
  let soma = 0; let qtd = 0;
  if(aluno.notas) {
    aluno.notas.forEach((n: any) => {
      if(n.b1 !== null) {soma += n.b1; qtd++;}
      if(n.b2 !== null) {soma += n.b2; qtd++;}
      if(n.b3 !== null) {soma += n.b3; qtd++;}
      if(n.b4 !== null) {soma += n.b4; qtd++;}
    });
  }
  const mediaTotal = qtd > 0 ? soma / qtd : 0;
  
  const cfg = getRiscoConfig(mediaTotal, faltasTotal);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 flex-shrink-0 text-lg">
        {aluno.profiles?.nome?.charAt(0) || "A"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{aluno.profiles?.nome}</p>
        <p className="text-xs text-slate-400">{aluno.turma} • RA: {aluno.ra}</p>
        <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
          <span>Faltas: <b>{faltasTotal}</b></span>
          <span>Média: <b>{qtd > 0 ? mediaTotal.toFixed(1) : "-"}</b></span>
          <span>{aluno.trabalha ? "Trabalha" : "Só estuda"}</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
        {cfg.emoji}
      </span>
    </div>
  );
}

export default function GestorAlunosPage() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "risco" | "atencao" | "normal">("todos");
  const [alunosData, setAlunosData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      // Carregar todos alunos com profile, e count de faltas
      const { data: alunosDB } = await supabase.from("alunos").select(`
        *,
        profiles!alunos_user_id_fkey(nome),
        faltas(count),
        notas(b1,b2,b3,b4)
      `);
      
      if(alunosDB) {
        // Classificar risco de cada um para permitir filtros
        const processados = alunosDB.map(a => {
          const faltasCount = a.faltas?.[0]?.count || 0;
          let soma = 0; let qtd = 0;
          if(a.notas) {
            a.notas.forEach((n: any) => {
              if(n.b1 !== null) {soma += n.b1; qtd++;}
              if(n.b2 !== null) {soma += n.b2; qtd++;}
              if(n.b3 !== null) {soma += n.b3; qtd++;}
              if(n.b4 !== null) {soma += n.b4; qtd++;}
            });
          }
          const media = qtd > 0 ? soma/qtd : 0;
          
          let pontos = 0;
          if (faltasCount > 5) pontos++;
          if (media > 0 && media < 6) pontos++;
          
          let calcSituacao = "normal";
          if(pontos >= 2) calcSituacao = "risco";
          else if(pontos === 1) calcSituacao = "atencao";
          
          return { ...a, _situacao: calcSituacao };
        });
        
        setAlunosData(processados);
      }
      setLoading(false);
    }
    load();
  }, []);

  const riscoCount = alunosData.filter(a => a._situacao === "risco").length;
  const atencaoCount = alunosData.filter(a => a._situacao === "atencao").length;
  const normalCount = alunosData.filter(a => a._situacao === "normal").length;

  const alunosFiltrados = alunosData
    .filter((a) => filtro === "todos" || a._situacao === filtro)
    .filter((a) => {
      const nomeMatch = (a.profiles?.nome || "").toLowerCase().includes(busca.toLowerCase());
      const raMatch = (a.ra || "").includes(busca);
      return nomeMatch || raMatch;
    });

  return (
    <div className="app-shell min-h-screen bg-slate-50 pb-20">
      <header className="bg-white px-4 pt-5 pb-3 border-b border-slate-100 sticky top-0 z-40">
        <h1 className="font-semibold text-slate-800 mb-3">Painel de Alunos</h1>

        {/* Resumo rápido */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          <button 
            onClick={() => setFiltro("todos")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold border ${filtro === "todos" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}
          >
            Todos ({alunosData.length})
          </button>
          <button 
            onClick={() => setFiltro("risco")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold border ${filtro === "risco" ? "bg-red-600 text-white border-red-600" : "bg-red-50 text-red-700 border-red-200"}`}
          >
            Risco ({riscoCount})
          </button>
          <button 
            onClick={() => setFiltro("atencao")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold border ${filtro === "atencao" ? "bg-amber-500 text-white border-amber-500" : "bg-amber-50 text-amber-700 border-amber-200"}`}
          >
            Atenção ({atencaoCount})
          </button>
          <button 
            onClick={() => setFiltro("normal")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold border ${filtro === "normal" ? "bg-green-600 text-white border-green-600" : "bg-green-50 text-green-700 border-green-200"}`}
          >
            Normal ({normalCount})
          </button>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou RA" 
            value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full bg-slate-100 border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </header>

      <div className="px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-slate-500 py-8 text-sm">Carregando lista de alunos...</p>
        ) : alunosFiltrados.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">Nenhum aluno encontrado.</p>
        ) : (
          alunosFiltrados.map(a => <AlunoCard key={a.id} aluno={a} />)
        )}
      </div>
    </div>
  );
}
