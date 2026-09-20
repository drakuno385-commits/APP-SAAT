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

    // Busca o role do usurio
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role ?? "aluno";
    const dest = role === "tutor" ? "/tutor/painel" : role === "gestor" ? "/gestor/relatorios" : "/aluno/dashboard";
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="app-shell min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-4xl"></span>
          </div>
          <div className="text-center">
            <h1 className="text-white text-4xl font-black tracking-tight">SAAT</h1>
            <p className="text-blue-200 text-sm mt-1">Sistema de Acompanhamento do Aluno Trabalhador</p>
          </div>
        </div>

        {/* Card de login */}
        <div className="w-full bg-white rounded-3xl shadow-2xl p-6">
          <h2 className="text-slate-800 font-bold text-xl mb-6">Entrar</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder=""
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <div className="text-right">
              <button type="button" className="text-blue-600 text-sm hover:underline">
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-base shadow-md"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Novo aluno?{" "}
              <a href="/cadastro" className="text-blue-600 font-semibold hover:underline">
                Cadastrar agora
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="pb-8 px-6 text-center">
        <p className="text-blue-200 text-sm font-medium">
          Seu estudo, seu trabalho, seu futuro. 
        </p>
      </div>
    </div>
  );
}
