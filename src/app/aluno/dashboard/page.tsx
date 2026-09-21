"use client";
import Link from "next/link";
import { Bell, Calendar, BookOpen, TrendingUp, User, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { PresencaPopup } from "@/components/presenca/PresencaPopup";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [nome, setNome] = useState('Aluno');
  const [alunoData, setAlunoData] = useState<any>(null); const [escolaData, setEscolaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Totais
  const [faltasCount, setFaltasCount] = useState(0);
  const [atividadesCount, setAtividadesCount] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if(user) {
        const { data: p } = await supabase.from('profiles').select('nome').eq('id', user.id).single();
        if(p) setNome(p.nome.split(' ')[0]);

        const { data: a } = await supabase.from('alunos').select('*').eq('user_id', user.id).single();
        if (a) {
          setAlunoData(a); if (a.escola_id) { const {data: e} = await supabase.from('escolas').select('*').eq('id', a.escola_id).single(); if(e) setEscolaData(e); }
          
          // Buscar faltas
          const { count: faltas } = await supabase.from("faltas").select('*', { count: 'exact' }).eq('aluno_id', a.id);
          setFaltasCount(faltas || 0);

          // Buscar atividades pendentes
          const { count: ativs } = await supabase.from("atividades").select('*', { count: 'exact' }).eq('aluno_id', a.id).eq('status', 'pendente');
          setAtividadesCount(ativs || 0);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const situacao = alunoData?.situacao ?? "normal";
  const media = alunoData?.media ? Number(alunoData.media).toFixed(1) : "-";
  
  const situacaoConfig = {
    normal: { icon: <CheckCircle size={16} className="text-green-600" />, label: "Tudo em ordem", bg: "bg-green-100", text: "text-green-700" },
    atencao: { icon: <AlertTriangle size={16} className="text-yellow-600" />, label: "Atenção", bg: "bg-yellow-100", text: "text-yellow-700" },
    risco: { icon: <AlertCircle size={16} className="text-red-600" />, label: "Risco de Reprovação", bg: "bg-red-100", text: "text-red-700" }
  };
  const config = situacaoConfig[situacao as keyof typeof situacaoConfig];

  return (
    <div className="app-shell min-h-screen bg-slate-50 relative pb-20">
      {escolaData && <PresencaPopup escola={escolaData} />}

      {/* Header Profile */}
      <header className="bg-blue-600 pt-12 pb-6 px-4 rounded-b-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-blue-100 text-sm font-medium">Bem-vindo de volta,</p>
            <h1 className="text-white text-2xl font-bold flex items-center gap-2">
              {nome} 👋
            </h1>
            {alunoData && (
              <p className="text-blue-100 text-xs mt-1">{alunoData.turma} • RA: {alunoData.ra}</p>
            )}
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white relative">
            <Bell size={20} />
            {atividadesCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-blue-600 rounded-full" />
            )}
          </button>
        </div>
        
        {/* Status Card Overlay */}
        <div className="bg-white rounded-2xl p-4 mt-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}>
              {config.icon}
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Status atual</p>
              <p className={`font-bold ${config.text}`}>{config.label}</p>
            </div>
          </div>
          <Link href="/aluno/perfil" className="text-blue-600 font-semibold text-sm hover:underline">
            Ver perfil
          </Link>
        </div>
      </header>

      {loading ? (
        <p className="text-center text-slate-400 py-10">Carregando seus dados...</p>
      ) : (
        <div className="px-4 mt-6 flex flex-col gap-6">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/aluno/rotina" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 hover:border-blue-200 transition group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Minha Rotina</p>
                <p className="text-[10px] text-slate-400">Ver horários</p>
              </div>
            </Link>

            <Link href="/aluno/notas" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 hover:border-indigo-200 transition group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Boletim</p>
                <p className="text-[10px] text-slate-400">Média: {media}</p>
              </div>
            </Link>

            <Link href="/aluno/atividades" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 hover:border-orange-200 transition group relative">
              {atividadesCount > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {atividadesCount}
                </span>
              )}
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Atividades</p>
                <p className="text-[10px] text-slate-400">Tarefas pendentes</p>
              </div>
            </Link>

            <Link href="/aluno/faltas" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 hover:border-red-200 transition group">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Faltas</p>
                <p className="text-[10px] text-slate-400">{faltasCount} registros</p>
              </div>
            </Link>
          </div>

          {/* Banner Tutor */}
          <Link href="/aluno/tutor" className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform" />
            <div className="relative z-10 max-w-[70%]">
              <h2 className="text-white font-bold text-lg leading-tight mb-1">Apoio Pedagógico</h2>
              <p className="text-slate-300 text-xs">Fale com seu tutor para melhorar seu desempenho e organizar estudos.</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center relative z-10 shrink-0">
              <User size={28} className="text-white" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
