"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, Plus, Save, Calendar, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MATERIA_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Matemática": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  "Português":  { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "História":   { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  "Ciências":   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "Geografia":  { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  "Inglês":     { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
};

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [alunoId, setAlunoId] = useState<string | null>(null);

  // Form states
  const [novaMateria, setNovaMateria] = useState("Matemática");
  const [novoTipo, setNovoTipo] = useState("");
  const [novaData, setNovaData] = useState("");
  const [novoUrl, setNovoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: aluno } = await supabase.from("alunos").select("id").eq("user_id", user.id).single();
      if (aluno) {
        setAlunoId(aluno.id);
        const { data } = await supabase
          .from("atividades")
          .select("*")
          .eq("aluno_id", aluno.id)
          .order("data", { ascending: true });
        if (data) setAtividades(data);
      }
    }
    setLoading(false);
  }

  async function adicionarAtividade() {
    if (!novoTipo || !novaData || !alunoId) return;
    setSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase.from("atividades").insert({
      aluno_id: alunoId,
      materia: novaMateria,
      tipo: novoTipo,
      data: novaData,
      status: "pendente",
      conteudo_url: novoUrl || null
    });

    setSaving(false);
    if (!error) {
      setShowAdd(false);
      setNovoTipo("");
      setNovaData("");
      setNovoUrl("");
      carregarDados();
    }
  }

  async function marcarConcluido(id: string) {
    const supabase = createClient();
    await supabase.from("atividades").update({ status: "concluida" }).eq("id", id);
    carregarDados();
  }

  const pendentes = atividades.filter((a) => a.status === "pendente");
  const concluidas = atividades.filter((a) => a.status === "concluida");

  return (
    <div className="app-shell min-h-screen bg-white pb-24">
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Link href="/aluno/dashboard" className="p-1 -ml-2 rounded-full hover:bg-slate-100">
            <ChevronRight size={24} className="text-slate-600 rotate-180" />
          </Link>
          <h1 className="font-semibold text-slate-800">Atividades</h1>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold"
        >
          <Plus size={20} />
        </button>
      </header>

      {showAdd && (
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 mb-3 text-sm">Nova Atividade</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select 
                value={novaMateria} onChange={e => setNovaMateria(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                {Object.keys(MATERIA_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
                <option value="Outros">Outros</option>
              </select>
              <input 
                type="date" 
                value={novaData} onChange={e => setNovaData(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <input 
              type="text" 
              placeholder="Descrição da atividade (Ex: Resumo Cap 3)"
              value={novoTipo} onChange={e => setNovoTipo(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
            <input 
              type="url" 
              placeholder="Link do material (opcional)"
              value={novoUrl} onChange={e => setNovoUrl(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
            <button 
              onClick={adicionarAtividade}
              disabled={saving || !novoTipo || !novaData}
              className="w-full bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"
            >
              {saving ? "Salvando..." : <><Save size={18}/> Salvar Atividade</>}
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-5 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-slate-800">Para fazer</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
              {pendentes.length} pendentes
            </span>
          </div>
          
          {loading ? (
            <p className="text-sm text-slate-500 text-center py-4">Carregando...</p>
          ) : pendentes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">Nenhuma atividade pendente!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendentes.map((a) => {
                const colors = MATERIA_COLORS[a.materia] ?? { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400" };
                const dataEntrega = new Date(a.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                return (
                  <div key={a.id} className={`rounded-2xl p-4 border border-slate-100 ${colors.bg}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${colors.dot}`} />
                        <span className={`text-sm font-bold ${colors.text}`}>{a.materia}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md">
                        <Calendar size={12} className={colors.text} />
                        <span className={`text-xs font-bold ${colors.text}`}>{dataEntrega}</span>
                      </div>
                    </div>
                    <p className="text-slate-800 font-medium text-sm mt-1">{a.tipo}</p>
                    
                    <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
                      {a.conteudo_url ? (
                        <a href={a.conteudo_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs font-bold hover:underline flex-shrink-0 ${colors.text}`}>
                          <ExternalLink size={14} /> Acessar Link
                        </a>
                      ) : <div/>}
                      <button 
                        onClick={() => marcarConcluido(a.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${colors.text} border-current hover:bg-white/50 transition`}
                      >
                        Marcar como feita
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {concluidas.length > 0 && (
          <div>
            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              Concluídas
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                {concluidas.length}
              </span>
            </h2>
            <div className="flex flex-col gap-2 opacity-60">
              {concluidas.map((a) => (
                <div key={a.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700 line-through">{a.tipo}</p>
                    <p className="text-xs text-slate-400">{a.materia}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
