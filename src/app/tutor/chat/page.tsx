"use client";
import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { mockAlunosTutor, mockMensagens } from "@/lib/mock-data";

export default function TutorChatPage() {
  const [alunoAtivo, setAlunoAtivo] = useState<string | null>(null);
  const [msgs, setMsgs] = useState(mockMensagens);
  const [texto, setTexto] = useState("");

  const aluno = mockAlunosTutor.find((a) => a.id === alunoAtivo);

  function enviar() {
    if (!texto.trim() || !alunoAtivo) return;
    setMsgs([...msgs, {
      id: `m${Date.now()}`, remetente_id: "tutor-1",
      destinatario_id: alunoAtivo, texto, created_at: new Date().toISOString(), lida: false,
    }]);
    setTexto("");
  }

  if (alunoAtivo && aluno) {
    const conversa = msgs.filter(
      (m) => (m.remetente_id === "tutor-1" && m.destinatario_id === alunoAtivo) ||
             (m.remetente_id === alunoAtivo && m.destinatario_id === "tutor-1")
    );
    return (
      <div className="app-shell min-h-screen bg-slate-50 flex flex-col">
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-40">
          <button onClick={() => setAlunoAtivo(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-600 text-xl">←</button>
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">{aluno.profile?.nome[0]}</div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{aluno.profile?.nome}</p>
            <p className="text-xs text-slate-400">{aluno.turma} · RA: {aluno.ra}</p>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 flex flex-col gap-3 pb-24 overflow-y-auto">
          {conversa.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">Inicie a conversa com {aluno.profile?.nome}</div>
          )}
          {conversa.map((m) => {
            const isMine = m.remetente_id === "tutor-1";
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"}`}>
                  {m.texto}
                  <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-slate-400"}`}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-4 py-3 flex gap-2">
          <input value={texto} onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            placeholder="Digite uma mensagem..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={enviar} className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition flex-shrink-0">
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="bg-white px-4 py-4 border-b border-slate-100 sticky top-0 z-40">
        <h1 className="font-semibold text-slate-800">Mensagens</h1>
      </header>

      <div className="px-4 py-4 flex flex-col gap-2 pb-24">
        {mockAlunosTutor.map((a) => (
          <button key={a.id} onClick={() => setAlunoAtivo(a.id)} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-md transition text-left w-full">
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 flex-shrink-0">{a.profile?.nome[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{a.profile?.nome}</p>
              <p className="text-xs text-slate-400 truncate">{a.turma} · RA: {a.ra}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
          </button>
        ))}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/tutor/painel", label: "Painel", icon: "🏠" },
            { href: "/tutor/alunos", label: "Alunos", icon: "👥" },
            { href: "/tutor/chat", label: "Mensagens", icon: "💬" },
            { href: "/tutor/perfil", label: "Perfil", icon: "👤" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${item.href === "/tutor/chat" ? "text-blue-600" : "text-slate-400"}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
