"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function AlunoCard({ aluno }: { aluno: any }) {
  const cfg = {
    normal: { bg: "#dcfce7", color: "#16a34a", label: "Normal", emoji: "🟢" },
    atencao: { bg: "#fef3c7", color: "#d97706", label: "Atenção", emoji: "🟡" },
    risco: { bg: "#fee2e2", color: "#dc2626", label: "Risco", emoji: "🔴" }
  }[aluno.status as "normal" | "atencao" | "risco"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">
        {aluno.profiles?.nome?.charAt(0) || "A"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{aluno.profiles?.nome}</p>
        <p className="text-[10px] text-slate-400">{aluno.turma} • RA: {aluno.ra}</p>
        <div className="flex gap-2 mt-1 text-[10px] text-slate-500">
          <span>Faltas: <b>{aluno.faltasCount}</b></span>
          <span>Média: <b>{aluno.mediaCalc}</b></span>
        </div>
      </div>
      <span className="text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0"
        style={{ backgroundColor: cfg?.bg, color: cfg?.color }}>
        {cfg?.label}
      </span>
    </div>
  );
}

export default function DetalhesTutorPage({ params }: { params: { id: string } }) {
  const [tutor, setTutor] = useState<any>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "normal" | "atencao" | "risco">("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      
      const { data: tutorProfile } = await supabase.from("profiles").select("*").eq("id", params.id).single();
      if(tutorProfile) setTutor(tutorProfile);

      const { data: alunosDB } = await supabase.from("alunos").select(`
        *,
        profiles!alunos_user_id_fkey(nome),
        faltas(count),
        notas(b1,b2,b3,b4)
      `).eq("tutor_id", params.id).eq("tutor_status", "aprovado");

      if (alunosDB) {
        const processados = alunosDB.map((a: any) => {
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
          
          let status = "normal";
          if(pontos >= 2) status = "risco";
          else if(pontos === 1) status = "atencao";

          return { ...a, status, faltasCount, mediaCalc: qtd > 0 ? media.toFixed(1) : "-" };
        });
        setAlunos(processados);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">Carregando dados do tutor...</div>;
  if (!tutor) return <div className="p-8 text-center text-red-500 font-bold">Tutor não encontrado.</div>;

  const riscoCount = alunos.filter((a: any) => a.status === "risco").length;
  const atencaoCount = alunos.filter((a: any) => a.status === "atencao").length;
  const normalCount = alunos.filter((a: any) => a.status === "normal").length;

  const alunosFiltrados = alunos
    .filter(a => filtro === "todos" || a.status === filtro)
    .filter(a => (a.profiles?.nome || "").toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="bg-purple-700 px-4 pt-6 pb-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/gestor/relatorios" className="text-white">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-white text-lg font-bold flex-1 truncate">Desempenho do Tutor</h1>
        </div>
        <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm flex items-center gap-4">
           <div className="w-14 h-14 bg-white text-purple-700 font-bold text-2xl flex items-center justify-center rounded-full flex-shrink-0">
             {tutor.nome.charAt(0)}
           </div>
           <div className="text-white">
             <h2 className="font-bold text-xl leading-tight">{tutor.nome}</h2>
             <p className="text-purple-200 text-xs mt-1">{alunos.length} alunos sob tutoria</p>
           </div>
        </div>
      </header>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setFiltro("todos")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold border ${filtro === "todos" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFiltro("normal")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold border ${filtro === "normal" ? "bg-green-600 text-white border-green-600" : "bg-white text-green-700 border-green-200"}`}
          >
            Bons ({normalCount})
          </button>
          <button 
            onClick={() => setFiltro("atencao")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold border ${filtro === "atencao" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-700 border-amber-200"}`}
          >
            Atenção ({atencaoCount})
          </button>
          <button 
            onClick={() => setFiltro("risco")} 
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold border ${filtro === "risco" ? "bg-red-600 text-white border-red-600" : "bg-white text-red-700 border-red-200"}`}
          >
            Críticos ({riscoCount})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar aluno do tutor..." 
            value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {alunosFiltrados.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm bg-white rounded-2xl border border-slate-200">
              Nenhum aluno encontrado neste filtro.
            </p>
          ) : (
            alunosFiltrados.map(a => <AlunoCard key={a.id} aluno={a} />)
          )}
        </div>
      </div>
    </div>
  );
}
