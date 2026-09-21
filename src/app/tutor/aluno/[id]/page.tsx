"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, AlertTriangle, BookOpen, User, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DetalhesAlunoTutorPage({ params }: { params: { id: string } }) {
  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState<any[]>([]);
  const [faltasCount, setFaltasCount] = useState(0);

  useEffect(() => {
    async function carregarAluno() {
      const supabase = createClient();
      
      const { data: a } = await supabase
        .from("alunos")
        .select("*, profiles!alunos_user_id_fkey(nome)")
        .eq("id", params.id)
        .single();
        
      if (a) {
        setAluno(a);
        
        const { data: n } = await supabase.from("notas").select("*").eq("aluno_id", a.id);
        if (n) setNotas(n);
        
        const { count } = await supabase.from("faltas").select("*", { count: "exact" }).eq("aluno_id", a.id);
        setFaltasCount(count || 0);
      }
      setLoading(false);
    }
    carregarAluno();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Carregando detalhes...</div>;
  if (!aluno) return <div className="p-8 text-center text-red-500 font-bold">Aluno não encontrado.</div>;

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="bg-indigo-600 px-4 pt-6 pb-6 sticky top-0 z-10 shadow-md flex items-center gap-3">
        <Link href="/tutor/alunos" className="text-white">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-white text-xl font-bold flex-1 truncate">Perfil do Aluno</h1>
      </header>

      <div className="p-4 flex flex-col gap-5 pb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-700 mb-3">
            {aluno.profiles?.nome.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-slate-800 text-center">{aluno.profiles?.nome}</h2>
          <p className="text-slate-500 text-sm mt-1">{aluno.turma} • RA: {aluno.ra}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle size={20} />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Faltas Totais</p>
            <p className="text-2xl font-black text-slate-800">{faltasCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <TrendingUp size={20} />
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Média Geral</p>
            <p className="text-2xl font-black text-slate-800">{aluno.media ? Number(aluno.media).toFixed(1) : "-"}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600"/>
            Desempenho por Matéria
          </h3>
          
          {notas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              Nenhuma nota registrada pelo aluno.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {notas.map(n => {
                let soma = 0;
                let qtd = 0;
                if (n.b1 !== null) { soma += Number(n.b1); qtd++; }
                if (n.b2 !== null) { soma += Number(n.b2); qtd++; }
                if (n.b3 !== null) { soma += Number(n.b3); qtd++; }
                if (n.b4 !== null) { soma += Number(n.b4); qtd++; }
                
                const media = qtd > 0 ? (soma / qtd).toFixed(1) : "-";
                
                return (
                  <div key={n.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{n.materia}</span>
                    <span className="font-black text-indigo-600 text-lg">{media}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
