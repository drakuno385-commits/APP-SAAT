"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, ChevronLeft, LayoutDashboard, Users, MessageSquare, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TutorChatPage() {
  const [alunoAtivo, setAlunoAtivo] = useState<any>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarAlunos() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Carrega apenas os alunos aprovados pelo tutor
        const { data } = await supabase
          .from("alunos")
          .select("*, profiles(nome)")
          .eq("tutor_id", user.id)
          .eq("tutor_status", "aprovado");
        if (data) setAlunos(data);
      }
      setLoading(false);
    }
    carregarAlunos();
  }, []);

  function enviar() {
    if (!texto.trim() || !alunoAtivo) return;
    setMsgs([...msgs, {
      id: `m${Date.now()}`,
      remetente_id: "tutor",
      destinatario_id: alunoAtivo.id,
      texto,
      created_at: new Date().toISOString(),
      eu: true
    }]);
    setTexto("");
  }

  if (alunoAtivo) {
    const conversa = msgs.filter((m) => m.destinatario_id === alunoAtivo.id || m.remetente_id === alunoAtivo.id);
    return (
      <div className="app-shell min-h-screen bg-slate-50 flex flex-col">
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-40">
          <button onClick={() => setAlunoAtivo(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-600">
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
            {alunoAtivo.profiles?.nome.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{alunoAtivo.profiles?.nome}</p>
            <p className="text-xs text-slate-400">{alunoAtivo.turma} â€¢ RA: {alunoAtivo.ra}</p>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 flex flex-col gap-3 pb-24 overflow-y-auto">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Hoje
            </span>
          </div>
          {conversa.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">Nenhuma mensagem enviada. Mande um 'OlÃ¡' para {alunoAtivo.profiles?.nome}!</div>
          )}
          {conversa.map((m) => (
            <div key={m.id} className={`flex ${m.eu ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.eu ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"}`}>
                <p className="text-sm">{m.texto}</p>
                <span className={`text-[10px] block mt-1 ${m.eu ? "text-indigo-200 text-right" : "text-slate-400"}`}>Agora</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={enviar}
              className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-indigo-700 transition"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50 pb-20">
      <header className="bg-indigo-600 px-4 pt-6 pb-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-white text-xl font-bold">Mensagens</h1>
        </div>
        <p className="text-indigo-200 text-sm">Converse com seus alunos aprovados.</p>
      </header>

      <div className="px-4 py-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando contatos...</p>
        ) : alunos.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <MessageSquare size={32} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Nenhum aluno aprovado.</p>
            <p className="text-slate-400 text-sm mt-1">VÃ¡ na aba Alunos e aprove as solicitaÃ§Ãµes.</p>
          </div>
        ) : (
          alunos.map(aluno => (
            <button 
              key={aluno.id} 
              onClick={() => setAlunoAtivo(aluno)}
              className="w-full bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm hover:border-indigo-300 transition text-left"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center shrink-0 text-lg">
                {aluno.profiles?.nome.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-slate-800 text-base">{aluno.profiles?.nome}</h3>
                <p className="text-slate-500 text-sm truncate">Toque para abrir a conversa...</p>
              </div>
            </button>
          ))
        )}
      </div>

            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/tutor/painel", label: "Painel", icon: LayoutDashboard },
            { href: "/tutor/alunos", label: "Alunos", icon: Users },
            { href: "/tutor/chat", label: "Mensagens", icon: MessageSquare },
            { href: "/tutor/perfil", label: "Perfil", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            // Simplificado para evitar window reference is not defined during SSR (Hydration mismatch)
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-slate-400 hover:text-indigo-600 focus:text-indigo-600">
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
