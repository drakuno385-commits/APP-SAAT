"use client";
import Link from "next/link";
import { Bell, Calendar, BookOpen, TrendingUp, User, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { mockAluno, mockTutor } from "@/lib/mock-data";
import { PresencaPopup } from "@/components/presenca/PresencaPopup";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [nome, setNome] = useState('Aluno');
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if(user) {
        const { data: p } = await supabase.from('profiles').select('nome').eq('id', user.id).single();
        if(p) setNome(p.nome.split(' ')[0]);
      }
    }
    load();
  }, []);
  const aluno = mockAluno;
  const tutor = mockTutor;

  const situacao = aluno.situacao ?? "normal";

  const situacaoConfig = {
    normal: {
      icon: <CheckCircle size={16} className="text-green-600" />,
      label: "Normal",
      bg: "bg-green-50 border-green-200",
      textColor: "text-green-800",
      descColor: "text-green-700",
      description: "Você está em dia com seus estudos. Continue assim!",
    },
    atencao: {
      icon: <AlertTriangle size={16} className="text-yellow-600" />,
      label: "Atenção",
      bg: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-800",
      descColor: "text-yellow-700",
      description: "Identificamos algumas dificuldades na conciliação entre trabalho e escola. Converse com seu tutor.",
    },
    risco: {
      icon: <AlertCircle size={16} className="text-red-600" />,
      label: "Risco",
      bg: "bg-red-50 border-red-200",
      textColor: "text-red-800",
      descColor: "text-red-700",
      description: "Atenção! Você está em risco de reprovação. Procure seu tutor imediatamente.",
    },
  }[situacao];

  return (
    <div className="app-shell min-h-screen bg-white">
      {/* Pop-up de presença */}
      <PresencaPopup escola={aluno.escola!} />

      {/* Header */}
      <header className="bg-blue-600 px-4 pt-10 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">
              Ol�, {nome}! 👋
            </h1>
            <p className="text-blue-200 text-sm mt-1">Seu acompanhamento</p>
          </div>
          <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Bell size={18} className="text-white" />
          </button>
        </div>
      </header>

      <div className="px-4 -mt-2">
        {/* Cards de resumo */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/aluno/faltas">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-red-500" />
                <span className="text-xs text-slate-500 font-medium">Faltas</span>
              </div>
              <p className="text-3xl font-black text-slate-800">{aluno.faltas_total}</p>
            </div>
          </Link>

          <Link href="/aluno/notas">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-indigo-500" />
                <span className="text-xs text-slate-500 font-medium">Notas</span>
              </div>
              <p className="text-3xl font-black text-slate-800">{aluno.media?.toFixed(1)}</p>
            </div>
          </Link>

          <Link href="/aluno/atividades">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-orange-500" />
                <span className="text-xs text-slate-500 font-medium">Ativ. pendentes</span>
              </div>
              <p className="text-3xl font-black text-slate-800">{aluno.atividades_pendentes}</p>
            </div>
          </Link>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-500" />
              <span className="text-xs text-slate-500 font-medium">Desempenho</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{aluno.media?.toFixed(1)}</p>
          </div>

          <Link href="/aluno/tutor">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-purple-500" />
                <span className="text-xs text-slate-500 font-medium">Tutor</span>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {tutor.nome.split(" ")[0]}<br />
                <span className="font-normal text-slate-500">{tutor.nome.split(" ").slice(1).join(" ")}</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Situação atual */}
        <div className={`rounded-2xl p-4 border mb-4 ${situacaoConfig.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            {situacaoConfig.icon}
            <span className={`text-sm font-bold ${situacaoConfig.textColor}`}>
              Situação atual: {situacaoConfig.label}
            </span>
          </div>
          <p className={`text-xs ${situacaoConfig.descColor}`}>
            {situacaoConfig.description}
          </p>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link href="/aluno/atividades">
            <button className="w-full border border-blue-600 text-blue-600 font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition">
              Ver atividades
            </button>
          </Link>
          <Link href="/aluno/tutor">
            <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-blue-700 transition">
              Falar com tutor
            </button>
          </Link>
        </div>
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
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                item.href === "/aluno/dashboard" ? "text-blue-600" : "text-slate-400"
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


