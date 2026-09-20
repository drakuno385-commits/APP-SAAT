"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, BookOpen, Briefcase, AlertTriangle } from "lucide-react";
import { mockAluno } from "@/lib/mock-data";

export default function RotinaPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const aluno = mockAluno;

  const entradaEscola = "07:00";
  const saidaEscola = "16:00";
  const entradaTrabalho = aluno.trabalho_entrada || "17:00";
  const saidaTrabalho = aluno.trabalho_saida || "22:00";

  // Calcula tempo livre
  const [stH, stM] = saidaTrabalho.split(":").map(Number);
  const tempoLivreInicio = `${String(stH).padStart(2, "0")}:${String(stM + 30).padStart(2, "0")}`;
  const tempoLivreFim = "23:30";
  const tempoLivreHoras = 1; // 1h disponvel

  async function handleSalvar() {
    setSaved(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push("/aluno/dashboard");
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </button>
        <h1 className="font-semibold text-slate-800">Minha rotina</h1>
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-xl"></span>
        </div>
      </header>

      <div className="px-4 py-6 flex flex-col gap-4">
        {/* Escola */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-blue-600" />
            </div>
            <span className="font-semibold text-slate-800">Escola</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Entrada</p>
              <p className="text-2xl font-bold text-slate-800">{entradaEscola}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Sada</p>
              <p className="text-2xl font-bold text-slate-800">{saidaEscola}</p>
            </div>
          </div>
        </div>

        {/* Trabalho */}
        {aluno.trabalha && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-orange-600" />
              </div>
              <span className="font-semibold text-slate-800">Trabalho</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Entrada</p>
                <p className="text-2xl font-bold text-slate-800">{entradaTrabalho}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Sada</p>
                <p className="text-2xl font-bold text-slate-800">{saidaTrabalho}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tempo disponvel */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-blue-600" />
            </div>
            <span className="font-semibold text-slate-800">Tempo disponvel para estudar</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {tempoLivreInicio}  {tempoLivreFim}
          </p>
        </div>

        {/* Alerta de tempo reduzido */}
        {tempoLivreHoras < 2 && (
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 flex gap-3">
            <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Pouco tempo para estudar</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Seu tempo disponvel para estudo  reduzido. Seu tutor poder ajud-lo a organizar sua rotina.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSalvar}
          disabled={saved}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-base shadow-md mt-2"
        >
          {saved ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
