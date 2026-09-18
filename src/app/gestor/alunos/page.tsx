"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import { mockAlunosTutor } from "@/lib/mock-data";
import { getRiscoConfig } from "@/lib/utils";
import { Aluno } from "@/lib/types";

function AlunoCard({ aluno }: { aluno: Aluno }) {
  const cfg = getRiscoConfig(aluno.situacao ?? "normal");
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 flex-shrink-0 text-lg">
        {aluno.profile?.nome[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{aluno.profile?.nome}</p>
        <p className="text-xs text-slate-400">{aluno.turma} · RA: {aluno.ra}</p>
        <div className="flex gap-3 mt-1 text-xs text-slate-500">
          <span>Faltas: <b>{aluno.faltas_total}</b></span>
          <span>Média: <b>{aluno.media?.toFixed(1)}</b></span>
          <span>{aluno.trabalha ? "💼 Trabalha" : "📚 Só estuda"}</span>
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

  const alunos = mockAlunosTutor
    .filter((a) => filtro === "todos" || a.situacao === filtro)
    .filter((a) => a.profile?.nome.toLowerCase().includes(busca.toLowerCase()) || a.ra.includes(busca));

  const risco = mockAlunosTutor.filter((a) => a.situacao === "risco").length;
  const atencao = mockAlunosTutor.filter((a) => a.situacao === "atencao").length;
  const normal = mockAlunosTutor.filter((a) => a.situacao === "normal").length;

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="bg-white px-4 pt-5 pb-3 border-b border-slate-100 sticky top-0 z-40">
        <h1 className="font-semibold text-slate-800 mb-3">Alunos Trabalhadores</h1>

        {/* Resumo rápido */}
        <div className="flex gap-2 mb-3">
          {[
            { label: `${risco} Risco`, color: "bg-red-100 text-red-700", key: "risco" },
            { label: `${atencao} Atenção`, color: "bg-yellow-100 text-yellow-700", key: "atencao" },
            { label: `${normal} Normal`, color: "bg-green-100 text-green-700", key: "normal" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFiltro(filtro === f.key as typeof filtro ? "todos" : f.key as typeof filtro)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${f.color} ${filtro === f.key ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou RA..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </header>

      <div className="px-4 py-4 flex flex-col gap-2 pb-24">
        <p className="text-xs text-slate-400 mb-1">{alunos.length} aluno(s)</p>
        {alunos.map((a) => <AlunoCard key={a.id} aluno={a} />)}
        {alunos.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">Nenhum aluno encontrado</p>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/gestor/relatorios", label: "Relatórios", icon: "📊" },
            { href: "/gestor/alunos", label: "Alunos", icon: "👥" },
            { href: "/gestor/escola", label: "Escola", icon: "🏫" },
            { href: "/gestor/perfil", label: "Perfil", icon: "👤" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/gestor/alunos" ? "text-blue-600" : "text-slate-400"}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
