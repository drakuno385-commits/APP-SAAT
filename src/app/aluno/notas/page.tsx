"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, Save, Plus, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface NotaRow {
  id?: string;
  materia: string;
  b1: number | "";
  b2: number | "";
  b3: number | "";
  b4: number | "";
}

export default function NotasPage() {
  const [notas, setNotas] = useState<NotaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    carregarNotas();
  }, []);

  async function carregarNotas() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Busca o aluno_id vinculado ao usurio logado
    const { data: aluno } = await supabase.from("alunos").select("id").eq("user_id", user.id).single();
    if (aluno) {
      const { data: notasData } = await supabase.from("notas").select("*").eq("aluno_id", aluno.id);
      if (notasData && notasData.length > 0) {
        setNotas(notasData);
      } else {
        // Matrias padro se no houver nenhuma
        setNotas([
          { materia: "Matemtica", b1: "", b2: "", b3: "", b4: "" },
          { materia: "Portugus", b1: "", b2: "", b3: "", b4: "" },
          { materia: "Histria", b1: "", b2: "", b3: "", b4: "" },
          { materia: "Geografia", b1: "", b2: "", b3: "", b4: "" },
          { materia: "Cincias", b1: "", b2: "", b3: "", b4: "" }
        ]);
      }
    }
    setLoading(false);
  }

  function handleNotaChange(index: number, campo: keyof NotaRow, valor: string) {
    const novasNotas = [...notas];
    let numVal = valor === "" ? "" : parseFloat(valor);
    if (typeof numVal === "number" && numVal > 10) numVal = 10;
    if (typeof numVal === "number" && numVal < 0) numVal = 0;
    novasNotas[index] = { ...novasNotas[index], [campo]: numVal };
    setNotas(novasNotas);
  }

  function calcTotal(nota: NotaRow) {
    return (Number(nota.b1) || 0) + (Number(nota.b2) || 0) + (Number(nota.b3) || 0) + (Number(nota.b4) || 0);
  }

  function calcSituacao(nota: NotaRow) {
    const total = calcTotal(nota);
    if (total >= 20) return { label: "Aprovado", color: "text-green-600", bg: "bg-green-100" };
    // Se ainda tem campos vazios, est em andamento
    if (nota.b1 === "" || nota.b2 === "" || nota.b3 === "" || nota.b4 === "") {
      return { label: `Faltam ${Math.max(0, 20 - total).toFixed(1)} pts`, color: "text-blue-600", bg: "bg-blue-100" };
    }
    return { label: "Reprovado", color: "text-red-600", bg: "bg-red-100" };
  }

  async function salvarNotas() {
    setSaving(true);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: aluno } = await supabase.from("alunos").select("id").eq("user_id", user.id).single();
      
      if (aluno) {
        // Limpa notas antigas do aluno e insere as novas (mtodo simples)
        await supabase.from("notas").delete().eq("aluno_id", aluno.id);
        
        const inserts = notas.map(n => ({
          aluno_id: aluno.id,
          materia: n.materia,
          b1: n.b1 === "" ? null : n.b1,
          b2: n.b2 === "" ? null : n.b2,
          b3: n.b3 === "" ? null : n.b3,
          b4: n.b4 === "" ? null : n.b4
        }));
        
        const { error } = await supabase.from("notas").insert(inserts);
        if (!error) {
          setMessage("Notas salvas com sucesso!");
          setTimeout(() => setMessage(""), 3000);
        } else {
          setMessage("Erro ao salvar notas.");
        }
      }
    }
    setSaving(false);
  }

  function addMateria() {
    setNotas([...notas, { materia: "Nova Matria", b1: "", b2: "", b3: "", b4: "" }]);
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="app-shell min-h-screen bg-slate-50 pb-20">
      <header className="bg-blue-600 px-4 py-4 sticky top-0 z-10 flex items-center gap-3">
        <Link href="/aluno/dashboard" className="text-white">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-white text-lg font-bold">Boletim Anual</h1>
      </header>

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 items-start">
          <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-blue-900 font-bold text-sm">Objetivo: 20 Pontos</h3>
            <p className="text-blue-700 text-xs mt-1">
              Para ser aprovado, a soma das notas dos 4 bimestres deve ser igual ou maior que 20 pontos (mdia de 5.0 por bimestre).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notas.map((nota, i) => {
            const total = calcTotal(nota);
            const situacao = calcSituacao(nota);
            const progresso = Math.min(100, (total / 20) * 100);

            return (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <input
                  type="text"
                  value={nota.materia}
                  onChange={(e) => handleNotaChange(i, "materia", e.target.value)}
                  className="font-bold text-slate-800 text-lg bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none w-full mb-3"
                />
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 4].map((bim) => (
                    <div key={bim} className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 text-center">{bim} Bim</label>
                      <input
                        type="number"
                        min="0" max="10" step="0.1"
                        value={nota[`b${bim}` as keyof NotaRow]}
                        onChange={(e) => handleNotaChange(i, `b${bim}` as keyof NotaRow, e.target.value)}
                        placeholder="-"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg text-center py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Total acumulado</span>
                    <span className="font-black text-slate-800">{total.toFixed(1)} / 20</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${situacao.bg} ${situacao.color}`}>
                    {situacao.label}
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full ${total >= 20 ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={addMateria}
          className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition"
        >
          <Plus size={18} /> Adicionar Matria
        </button>

        {message && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm font-bold text-center rounded-xl flex items-center justify-center gap-2">
            <CheckCircle size={18} /> {message}
          </div>
        )}

        <button 
          onClick={salvarNotas}
          disabled={saving}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
        >
          <Save size={20} /> {saving ? "Salvando..." : "Salvar Boletim"}
        </button>
      </div>
    </div>
  );
}
