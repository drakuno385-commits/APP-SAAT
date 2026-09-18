"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Send, Calendar } from "lucide-react";
import { mockTutor, mockMensagens } from "@/lib/mock-data";

export default function TutorPage() {
  const tutor = mockTutor;
  const [mensagens, setMensagens] = useState(mockMensagens);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [showChat, setShowChat] = useState(false);

  function enviarMensagem() {
    if (!novaMensagem.trim()) return;
    setMensagens([
      ...mensagens,
      {
        id: `m${Date.now()}`,
        remetente_id: "aluno-1",
        destinatario_id: "tutor-1",
        texto: novaMensagem,
        created_at: new Date().toISOString(),
        lida: false,
      },
    ]);
    setNovaMensagem("");
  }

  if (showChat) {
    return (
      <div className="app-shell min-h-screen bg-slate-50 flex flex-col">
        {/* TopBar */}
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-40">
          <button onClick={() => setShowChat(false)} className="p-1 rounded-full hover:bg-slate-100">
            <ChevronRight size={20} className="text-slate-600 rotate-180" />
          </button>
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
            {tutor.nome[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{tutor.nome}</p>
            <p className="text-xs text-green-500">Em acompanhamento</p>
          </div>
        </header>

        {/* Mensagens */}
        <div className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-3 pb-28">
          {mensagens.map((msg) => {
            const isMine = msg.remetente_id === "aluno-1";
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMine
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                  }`}
                >
                  {msg.texto}
                  <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-slate-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-4 py-3 flex gap-2">
          <input
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={enviarMensagem}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition flex-shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <Link href="/aluno/dashboard" className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </Link>
        <h1 className="font-semibold text-slate-800">Tutor do Aluno Trabalhador</h1>
        <div className="w-8" />
      </header>

      <div className="px-4 py-6 flex flex-col gap-5">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-700">
            {tutor.nome[0]}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">{tutor.nome}</h2>
            <p className="text-sm text-slate-500 mt-1">Especialidade: {tutor.especialidade}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-500">Meu acompanhamento</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-600">Última conversa</span>
            <span className="text-sm font-semibold text-slate-800">{tutor.ultima_conversa}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-600 flex items-center gap-2">
              <Calendar size={14} /> Próximo acompanhamento
            </span>
            <span className="text-sm font-semibold text-slate-800">{tutor.proximo_acompanhamento}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-600">Situação</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-semibold">
              🟡 {tutor.situacao}
            </span>
          </div>
        </div>

        {/* Botões */}
        <button
          onClick={() => setShowChat(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          💬 Conversar com tutor
        </button>
        <button className="w-full border border-slate-200 text-slate-600 font-semibold py-3.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2">
          📅 Solicitar atendimento
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/aluno/dashboard", label: "Início", icon: "🏠" },
            { href: "/aluno/faltas", label: "Faltas", icon: "📋" },
            { href: "/aluno/atividades", label: "Atividades", icon: "📚" },
            { href: "/aluno/tutor", label: "Tutor", icon: "👨‍🏫" },
            { href: "/aluno/perfil", label: "Perfil", icon: "👤" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                item.href === "/aluno/tutor" ? "text-blue-600" : "text-slate-400"
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
