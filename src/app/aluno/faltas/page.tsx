"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, AlertTriangle, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Falta {
  id: string;
  materia: string;
  data: string;
  justificativa?: string;
}

export default function FaltasPage() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [loading, setLoading] = useState(true);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [novaFalta, setNovaFalta] = useState({ materia: "", data: "", justificativa: "" });
  const [salvando, setSalvando] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    carregarFaltas();
  }, []);

  async function carregarFaltas() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: aluno } = await supabase.from("alunos").select("id").eq("user_id", user.id).single();
      if (aluno) {
        setAlunoId(aluno.id);
        const { data: faltasData } = await supabase.from("faltas").select("*").eq("aluno_id", aluno.id).order("data", { ascending: false });
        if (faltasData) {
          setFaltas(faltasData);
        }
      }
    }
    setLoading(false);
  }

  async function handleSinalizarFalta(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId) return;
    
    setSalvando(true);
    const { data, error } = await supabase.from("faltas").insert({
      aluno_id: alunoId,
      materia: novaFalta.materia,
      data: novaFalta.data,
      justificativa: novaFalta.justificativa
    }).select().single();
    
    if (data) {
      setFaltas([data, ...faltas]);
      setShowModal(false);
      setNovaFalta({ materia: "", data: "", justificativa: "" });
    }
    setSalvando(false);
  }

  // Agrupar faltas por matéria
  const faltasPorMateria: Record<string, number> = {};
  faltas.forEach(f => {
    faltasPorMateria[f.materia] = (faltasPorMateria[f.materia] || 0) + 1;
  });
  
  const agrupadas = Object.keys(faltasPorMateria).map(m => ({
    materia: m,
    qtd: faltasPorMateria[m]
  }));

  const total = faltas.length;
  const limiteAlerta = 5;

  return (
    <div className="app-shell min-h-screen bg-white pb-20">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
        <Link href="/aluno/dashboard" className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </Link>
        <h1 className="font-semibold text-slate-800">Minhas faltas</h1>
        <button onClick={() => setShowModal(true)} className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
          <Plus size={20} />
        </button>
      </header>

      <div className="px-4 py-5 flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-slate-500 py-10">Carregando...</p>
        ) : (
          <>
            {/* Botão Sinalizar */}
            <button 
              onClick={() => setShowModal(true)}
              className="w-full bg-slate-50 border-2 border-dashed border-slate-200 text-slate-600 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition"
            >
              <AlertTriangle size={18} className="text-slate-400" />
              Sinalizar Falta (Aviso Antecipado)
            </button>

            {/* Tabela */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Matéria</th>
                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Faltas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {agrupadas.length === 0 && (
                    <tr><td colSpan={2} className="text-center py-6 text-slate-400 text-sm">Nenhuma falta registrada.</td></tr>
                  )}
                  {agrupadas.map(({ materia, qtd }) => (
                    <tr key={materia} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{materia}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`text-sm font-bold ${
                            qtd >= 2 ? "text-red-600" : qtd === 1 ? "text-yellow-600" : "text-slate-400"
                          }`}
                        >
                          {qtd}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50">
                <span className="text-sm font-bold text-slate-700">Total: {total} faltas</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    total >= limiteAlerta
                      ? "bg-red-100 text-red-700"
                      : total >= 2
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {total >= limiteAlerta ? " Alto" : total >= 2 ? " Atenção" : " Normal"}
                </span>
              </div>
            </div>

            {/* Alerta */}
            {total >= 2 && (
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 flex gap-3">
                <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Você está acumulando faltas.</p>
                  <p className="text-xs text-yellow-700 mt-0.5">Converse com seu tutor para organizar sua rotina.</p>
                </div>
              </div>
            )}

            {/* Histórico individual */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 mt-4">Histórico de faltas</h2>
              <div className="flex flex-col gap-2">
                {faltas.map((f) => (
                  <div key={f.id} className="flex flex-col bg-slate-50 rounded-xl px-4 py-3 gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{f.materia}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(f.data).toLocaleDateString("pt-BR", {timeZone: 'UTC'})}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        f.justificativa ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"
                      }`}>
                        {f.justificativa ? "Sinalizada/Justificada" : "Não justificada"}
                      </span>
                    </div>
                    {f.justificativa && (
                      <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2">"{f.justificativa}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Sinalizar Falta */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800">Sinalizar Falta</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSinalizarFalta} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Matéria</label>
                <input 
                  type="text" 
                  value={novaFalta.materia} onChange={e => setNovaFalta({...novaFalta, materia: e.target.value})}
                  placeholder="Ex: Todas, Matemática, História..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Data da Ausência</label>
                <input 
                  type="date" 
                  value={novaFalta.data} onChange={e => setNovaFalta({...novaFalta, data: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Motivo / Justificativa</label>
                <textarea 
                  value={novaFalta.justificativa} onChange={e => setNovaFalta({...novaFalta, justificativa: e.target.value})}
                  placeholder="Ex: Consulta médica, imprevisto no trabalho..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={salvando}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition mt-2 disabled:opacity-50"
              >
                {salvando ? "Enviando..." : "Confirmar Aviso de Falta"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/aluno/dashboard", label: "Início", icon: "🏠" },
            { href: "/aluno/faltas", label: "Faltas", icon: "📅" },
            { href: "/aluno/atividades", label: "Atividades", icon: "📝" },
            { href: "/aluno/tutor", label: "Tutor", icon: "💬" },
            { href: "/aluno/perfil", label: "Perfil", icon: "👤" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                item.href === "/aluno/faltas" ? "text-blue-600" : "text-slate-400"
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