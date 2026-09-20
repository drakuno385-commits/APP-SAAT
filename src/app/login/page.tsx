"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (authError || !data.user) {
      setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
      setLoading(false);
      return;
    }

    // Busca o role do usuário gravado no próprio token (seguro e sem delay de DB)
    sessionStorage.setItem("saat_session_active", "true");
    const role = data.user.user_metadata?.role || "aluno";
    const dest = role === "tutor" ? "/tutor/painel" : role === "gestor" ? "/gestor/relatorios" : "/aluno/dashboard";
    
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="app-shell min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">SAAT</h1>
          <p className="text-blue-200 text-sm font-medium">Sistema de Acompanhamento</p>
        </div>

        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Fazer Login</h2>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <input 
                type="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition mt-2 shadow-lg shadow-blue-200"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Ainda não tem conta? <br/>
              <button 
                onClick={() => router.push("/cadastro")}
                className="text-blue-600 font-bold mt-1 hover:underline"
              >
                Criar minha conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
