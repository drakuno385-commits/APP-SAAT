"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Send, UserCheck, Clock, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TutorPage() {
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState("");
  const [meuTutor, setMeuTutor] = useState<any>(null);
  const [tutorStatus, setTutorStatus] = useState<"pendente" | "aprovado" | null>(null);
  const [tutoresDisponiveis, setTutoresDisponiveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setMyUserId(user.id);
      
      // 1. Sempre carrega a lista de tutores primeiro
      const { data: lista } = await supabase.from("profiles").select("id, nome").eq("role", "tutor");
      setTutoresDisponiveis(lista || []);

      // 2. Tenta carregar o aluno
      const { data: alunoInfo, error: errAluno } = await supabase.from("alunos").select("id, tutor_id, tutor_status").eq("user_id", user.id).single();
      
      if (alunoInfo) {
        setAlunoId(alunoInfo.id);
        setTutorStatus(alunoInfo.tutor_status || null);
        
        if (alunoInfo.tutor_id) {
          const { data: tutorInfo } = await supabase.from("profiles").select("id, nome").eq("id", alunoInfo.tutor_id).single();
          setMeuTutor(tutorInfo);
        } else {
          setMeuTutor(null);
        }
      }
    }
    setLoading(false);
  }

  async function solicitarTutor(tutorId: string) {
    if (!alunoId) {
      alert("Erro: Seu cadastro de aluno não foi completado corretamente. Crie uma nova conta.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    
    // Se tutorId for vazio, significa que o aluno cancelou a solicitacao
    if (tutorId === "") {
      const { error } = await supabase.from("alunos").update({ 
        tutor_id: null, 
        tutor_status: null 
      }).eq("id", alunoId);
      if (error) alert("Erro ao cancelar: " + error.message);
    } else {
      const { error } = await supabase.from("alunos").update({ 
        tutor_id: tutorId, 
        tutor_status: "pendente" 
      }).eq("id", alunoId);
      if (error) alert("Erro ao solicitar tutor: " + error.message);
    }
    
    carregarDados();
  }

  async function enviarMensagem() {
    if (!novaMensagem.trim()) return;
    const msg = novaMensagem;
    setNovaMensagem("");
    
    // Optimistic UI
    setMensagens([...mensagens, { texto: msg, remetente_id: myUserId, id: Date.now() }]);
    
    const supabase = createClient();
    await supabase.from("mensagens").insert({
      remetente_id: myUserId,
      destinatario_id: meuTutor.id,
      texto: msg
    });
  }

  useEffect(() => {
    if (!showChat || !meuTutor || !myUserId) return;
    async function fetchMsgs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("mensagens")
        .select("*")
        .or(`and(remetente_id.eq.${myUserId},destinatario_id.eq.${meuTutor.id}),and(remetente_id.eq.${meuTutor.id},destinatario_id.eq.${myUserId})`)
        .order("created_at", { ascending: true });
      if (data) setMensagens(data);
    }
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => clearInterval(interval);
  }, [showChat, meuTutor, myUserId]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Carregando...</div>;

  if (!meuTutor || tutorStatus === null) {
    return (
      <div className="app-shell min-h-screen bg-slate-50">
        <header className="flex items-center px-4 py-4 border-b border-slate-200 bg-white">
          <Link href="/aluno/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ChevronRight size={24} className="text-slate-600 rotate-180" />
          </Link>
          <h1 className="font-bold text-slate-800 ml-2">Escolher Tutor</h1>
        </header>

        <div className="p-4 flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <UserPlus size={32} className="text-blue-500 mx-auto mb-2" />
            <h2 className="font-bold text-blue-800">Você ainda não tem um tutor!</h2>
            <p className="text-sm text-blue-600 mt-1">Selecione um professor abaixo para te orientar. O professor precisará aprovar sua solicitação.</p>
          </div>

          <h3 className="font-bold text-slate-700 mt-2">Tutores Disponíveis:</h3>
          <div className="space-y-3">
            {tutoresDisponiveis.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">Nenhum tutor cadastrado no sistema ainda.</p>
            ) : (
              tutoresDisponiveis.map(t => (
                <div key={t.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                      {t.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Prof. {t.nome}</h4>
                      <p className="text-xs text-slate-500">Tutor Pedagógico</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => solicitarTutor(t.id)}
                    className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-indigo-700 transition"
                  >
                    Solicitar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (tutorStatus === "pendente") {
    return (
      <div className="app-shell min-h-screen bg-slate-50">
        <header className="flex items-center px-4 py-4 border-b border-slate-200 bg-white">
          <Link href="/aluno/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ChevronRight size={24} className="text-slate-600 rotate-180" />
          </Link>
          <h1 className="font-bold text-slate-800 ml-2">Meu Tutor</h1>
        </header>

        <div className="p-4 flex flex-col items-center justify-center mt-10">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
            <Clock size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 text-center">Solicitação Enviada!</h2>
          <p className="text-slate-600 text-center mt-2 px-4">
            Você solicitou orientação do <strong className="text-slate-800">Prof. {meuTutor.nome}</strong>. 
            Aguarde o professor aprovar o seu pedido no painel dele.
          </p>
          
          <button 
            onClick={() => solicitarTutor("")}
            className="mt-8 text-red-500 font-bold text-sm border border-red-200 bg-red-50 px-6 py-3 rounded-xl"
          >
            Cancelar solicitação
          </button>
        </div>
      </div>
    );
  }

  if (showChat) {
    return (
      <div className="app-shell min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-3 sticky top-0">
          <button onClick={() => setShowChat(false)} className="p-1 rounded-full hover:bg-slate-100">
            <ChevronRight size={24} className="text-slate-600 rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              {meuTutor.nome.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 leading-tight">Prof. {meuTutor.nome}</h2>
              <p className="text-xs text-green-600 font-medium">Online</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Hoje
            </span>
          </div>
          {mensagens.map((msg, i) => {
            const isMine = msg.remetente_id === myUserId;
            return (
              <div key={msg.id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMine ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"}`}>
                  <p className="text-sm">{msg.texto}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 pb-8">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={enviarMensagem}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-blue-700 transition"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-white">
        <Link href="/aluno/dashboard" className="p-1 rounded-full hover:bg-slate-100 -ml-2">
          <ChevronRight size={24} className="text-slate-600 rotate-180" />
        </Link>
        <h1 className="font-semibold text-slate-800">Meu Tutor</h1>
        <div className="w-8" />
      </header>

      <div className="px-4 py-6 flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-blue-600"></div>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-3 relative z-10 shadow-lg p-1">
            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-700">
              {meuTutor.nome.charAt(0)}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-800">Prof. {meuTutor.nome}</h2>
            <UserCheck size={20} className="text-blue-500" />
          </div>
          <p className="text-blue-600 font-medium text-sm">Tutor Pedagógico</p>
          <p className="text-slate-500 text-sm mt-3 px-4">
            Acompanhamento escolar e orientação sobre organização de estudos.
          </p>

          <button 
            onClick={() => setShowChat(true)}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
          >
            <Send size={18} /> Iniciar Conversa
          </button>
          
          <button 
            onClick={() => setTutorStatus("pendente")}
            className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            Trocar de Tutor
          </button>
        </div>
      </div>
    </div>
  );
}
