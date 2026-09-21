"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, BookOpen, Briefcase, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RotinaPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alunoData, setAlunoData] = useState<any>(null);

  // Hardcoded Escola Horários
  const entradaEscola = "14:15";
  const saidaEscola = "21:15";

  useEffect(() => {
    async function carregarAluno() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("alunos").select("*").eq("user_id", user.id).single();
        if (data) {
          setAlunoData(data);
        }
      }
      setLoading(false);
    }
    carregarAluno();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando rotina...</div>;

  const trabalha = alunoData?.trabalha || false;
  const entradaTrabalho = alunoData?.trabalho_entrada || "08:00";
  const saidaTrabalho = alunoData?.trabalho_saida || "13:00";

  // Calcula tempo livre
  const [stH, stM] = saidaEscola.split(":").map(Number);
  const tempoLivreInicio = `${String(stH).padStart(2, "0")}:${String(stM + 30).padStart(2, "0")}`;
  const tempoLivreFim = "23:30";
  const tempoLivreHoras = 1.5; // Aproximadamente

  async function handleSalvar() {
    setSaved(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push("/aluno/dashboard");
  }

  return (
    <div className="app-shell min-h-screen bg-white pb-20">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-white sticky top-0">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </button>
        <h1 className="font-semibold text-slate-800">Minha rotina</h1>
        <div className="w-8 h-8 flex items-center justify-center"></div>
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
              <p className="text-xs text-slate-400 mb-1">Saída</p>
              <p className="text-2xl font-bold text-slate-800">{saidaEscola}</p>
            </div>
          </div>
        </div>

        {/* Trabalho (se houver) */}
        {trabalha && (
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
                <p className="text-xs text-slate-400 mb-1">Saída</p>
                <p className="text-2xl font-bold text-slate-800">{saidaTrabalho}</p>
              </div>
            </div>
          </div>
        )}

        {/* Diagnóstico Tempo Livre */}
        <div className="mt-4 border-2 border-indigo-100 bg-indigo-50/50 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 mb-1">Janela de Estudos</h3>
              <p className="text-sm text-indigo-700 leading-snug">
                Seu tempo livre sugerido é das <strong>{tempoLivreInicio} às {tempoLivreFim}</strong>.
              </p>
              {tempoLivreHoras < 2 && (
                <div className="flex gap-2 items-start mt-3 bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 font-medium">
                    Você tem pouco tempo livre (aprox. {tempoLivreHoras}h). 
                    Foque em revisar tópicos das provas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSalvar}
          disabled={saved}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md"
        >
          {saved ? "Salvo!" : "Confirmar Rotina"}
        </button>
      </div>
    </div>
  );
}
