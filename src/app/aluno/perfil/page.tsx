"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PerfilAlunoPage() {
  const [userProfile, setUserProfile] = useState({ nome: 'Aluno', ra: '---', letra: 'A' });
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if(user) {
        const { data: p } = await supabase.from('profiles').select('nome').eq('id', user.id).single();
        const { data: a } = await supabase.from('alunos').select('matricula').eq('user_id', user.id).single();
        if(p) setUserProfile({ nome: p.nome, ra: a?.matricula || '---', letra: p.nome.charAt(0).toUpperCase() });
      }
    }
    load();
  }, []);
  const router = useRouter();

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("saat_role");
    router.push("/login");
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      <header className="px-4 py-4 border-b border-slate-100">
        <h1 className="font-semibold text-slate-800">Perfil</h1>
      </header>

      <div className="px-4 py-6 flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
            J
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-lg">João da Silva</p>
            <p className="text-slate-500 text-sm">RA: {userProfile.ra}</p>
            <p className="text-slate-500 text-sm">2º Ano A — EE Professora Maria Aparecida</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
          <Link href="/aluno/rotina" className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-100 transition">
            <span className="text-sm text-slate-700">📅 Minha rotina</span>
            <span className="text-slate-400">›</span>
          </Link>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-100 transition">
            <span className="text-sm text-slate-700">🔔 Notificações</span>
            <span className="text-slate-400">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-100 transition">
            <span className="text-sm text-slate-700">🔒 Alterar senha</span>
            <span className="text-slate-400">›</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full border border-red-200 text-red-600 font-semibold py-3.5 rounded-xl hover:bg-red-50 transition"
        >
          Sair da conta
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
                item.href === "/aluno/perfil" ? "text-blue-600" : "text-slate-400"
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



