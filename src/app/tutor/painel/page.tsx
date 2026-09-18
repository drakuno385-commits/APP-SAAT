"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { mockAlunosTutor } from "@/lib/mock-data";
import { getRiscoConfig } from "@/lib/utils";
import { Aluno } from "@/lib/types";

function SituacaoBadge({ situacao }: { situacao: string }) {
  const cfg = getRiscoConfig(situacao);
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function AlunoCard({ aluno }: { aluno: Aluno }) {
  return (
    <Link href={`/tutor/aluno/${aluno.id}`}>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition flex items-center gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
          {aluno.profile?.nome[0]}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{aluno.profile?.nome}</p>
          <p className="text-xs text-slate-400">{aluno.turma}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>Faltas: <b>{aluno.faltas_total}</b></span>
            <span>Atrasos: <b>0</b></span>
            <span>Média: <b>{aluno.media?.toFixed(1)}</b></span>
          </div>
        </div>
        {/* Situação */}
        <div className="flex flex-col items-end gap-2">
          <SituacaoBadge situacao={aluno.situacao ?? "normal"} />
          <ChevronRight size={14} className="text-slate-300" />
        </div>
      </div>
    </Link>
  );
}

export default function TutorPainelPage() {
  const alunos = mockAlunosTutor;
  const risco = alunos.filter((a) => a.situacao === "risco").length;
  const atencao = alunos.filter((a) => a.situacao === "atencao").length;
  const normal = alunos.filter((a) => a.situacao === "normal").length;

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
        <button className="p-2 rounded-full hover:bg-slate-100">
          <span className="text-slate-600">☰</span>
        </button>
        <h1 className="font-semibold text-slate-800">Painel do Tutor</h1>
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 text-sm">
          CS
        </div>
      </header>

      <div className="px-4 py-5 flex flex-col gap-5 pb-24">
        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 rounded-2xl p-3 border border-red-100 text-center">
            <p className="text-3xl font-black text-red-600">{risco}</p>
            <p className="text-xs text-red-500 font-medium mt-1">em risco</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-3 border border-yellow-100 text-center">
            <p className="text-3xl font-black text-yellow-600">{atencao}</p>
            <p className="text-xs text-yellow-500 font-medium mt-1">em atenção</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 border border-green-100 text-center">
            <p className="text-3xl font-black text-green-600">{normal}</p>
            <p className="text-xs text-green-500 font-medium mt-1">normal</p>
          </div>
        </div>

        {/* Lista de alunos */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">Alunos acompanhados</h2>
          <div className="flex flex-col gap-2">
            {/* Risco primeiro */}
            {[...alunos]
              .sort((a, b) => {
                const order = { risco: 0, atencao: 1, normal: 2 };
                return (order[a.situacao ?? "normal"] ?? 2) - (order[b.situacao ?? "normal"] ?? 2);
              })
              .map((aluno) => (
                <AlunoCard key={aluno.id} aluno={aluno} />
              ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/tutor/painel", label: "Painel", icon: "🏠" },
            { href: "/tutor/alunos", label: "Alunos", icon: "👥" },
            { href: "/tutor/chat", label: "Mensagens", icon: "💬" },
            { href: "/tutor/perfil", label: "Perfil", icon: "👤" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                item.href === "/tutor/painel" ? "text-blue-600" : "text-slate-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
