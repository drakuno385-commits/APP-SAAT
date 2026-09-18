"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CheckSquare, Square } from "lucide-react";
import { mockAlunosTutor } from "@/lib/mock-data";

const PLANO_ITEMS = [
  "Conversar com o aluno",
  "Identificar dificuldade",
  "Orientar organização dos estudos",
  "Solicitar materiais aos professores",
  "Realizar novo acompanhamento",
];

export default function AlunoRiscoPage({ params }: { params: { id: string } }) {
  const aluno = mockAlunosTutor.find((a) => a.id === params.id) ?? mockAlunosTutor[0];
  const [plano, setPlano] = useState([true, true, true, true, false]);
  const [registrado, setRegistrado] = useState(false);

  function toggleItem(i: number) {
    setPlano((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  const isRisco = aluno.situacao === "risco";
  const isAtencao = aluno.situacao === "atencao";

  const motivos = [];
  if ((aluno.faltas_total ?? 0) > 5) motivos.push("Muitas faltas");
  if ((aluno.atividades_pendentes ?? 0) > 3) motivos.push("Atividades atrasadas");
  if ((aluno.media ?? 10) < 6) motivos.push("Baixo desempenho");
  if (aluno.trabalha) motivos.push("Pouco tempo disponível para estudar");

  return (
    <div className="app-shell min-h-screen bg-white">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <Link href="/tutor/painel" className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </Link>
        <h1 className="font-semibold text-slate-800 text-sm truncate mx-2">
          Acompanhamento de {aluno.profile?.nome}
        </h1>
        <div className="w-8" />
      </header>

      <div className="px-4 py-5 flex flex-col gap-5 pb-10">
        {/* Badge de risco */}
        {isRisco && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🔴</span>
            <div>
              <p className="text-red-700 font-bold">RISCO DE ABANDONO</p>
              <p className="text-red-600 text-xs mt-0.5">Ação imediata necessária</p>
            </div>
          </div>
        )}
        {isAtencao && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🟡</span>
            <div>
              <p className="text-yellow-700 font-bold">ATENÇÃO</p>
              <p className="text-yellow-600 text-xs mt-0.5">Monitorar de perto</p>
            </div>
          </div>
        )}

        {/* Motivos */}
        {motivos.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Motivos identificados</p>
            <ul className="flex flex-col gap-2">
              {motivos.map((m) => (
                <li key={m} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dados do aluno */}
        <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
          {[
            { label: "Turma", value: aluno.turma },
            { label: "Faltas", value: aluno.faltas_total },
            { label: "Atividades pendentes", value: aluno.atividades_pendentes },
            { label: "Média", value: aluno.media?.toFixed(1) },
            { label: "Trabalha", value: aluno.trabalha ? "Sim" : "Não" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-4 py-3">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>

        {/* Plano de acompanhamento */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Plano de acompanhamento</p>
          <div className="flex flex-col gap-2">
            {PLANO_ITEMS.map((item, i) => (
              <button
                key={item}
                onClick={() => toggleItem(i)}
                className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition text-left"
              >
                {plano[i] ? (
                  <CheckSquare size={18} className="text-blue-600 flex-shrink-0" />
                ) : (
                  <Square size={18} className="text-slate-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${plano[i] ? "text-slate-700 line-through" : "text-slate-700"}`}>
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={() => setRegistrado(true)}
          disabled={registrado}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-green-600 text-white font-bold py-3.5 rounded-xl transition"
        >
          {registrado ? "✅ Acompanhamento registrado!" : "Registrar acompanhamento"}
        </button>
      </div>
    </div>
  );
}
