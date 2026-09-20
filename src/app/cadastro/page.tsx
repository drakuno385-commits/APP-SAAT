"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TURMAS = ["1º Ano A", "1º Ano B", "2º Ano A", "2º Ano B", "3º Ano A", "3º Ano B"];
const DIAS = [
  { key: "seg", label: "Seg" }, { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" }, { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" }, { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<"dados" | "conta">("dados");
  const [form, setForm] = useState({
    nome: "", ra: "", turma: "", escola: "EE Prof. Eur�pedes Sim�es de Paula",
    trabalha: true, tipoTrabalho: "Atendente",
    diasTrabalho: ["seg", "ter", "qua", "qui", "sex"] as string[],
    horarioEntrada: "17:00", horarioSaida: "22:00",
    email: "", senha: "", confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDia(dia: string) {
    setForm((prev) => ({
      ...prev,
      diasTrabalho: prev.diasTrabalho.includes(dia)
        ? prev.diasTrabalho.filter((d) => d !== dia)
        : [...prev.diasTrabalho, dia],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.senha !== form.confirmarSenha) { setError("As senhas não coincidem."); return; }
    if (form.senha.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. Cria conta no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { data: { nome: form.nome } },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Erro ao criar conta. Tente outro e-mail.");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Cria profile com role=aluno
    await supabase.from("profiles").upsert({ id: userId, role: "aluno", nome: form.nome });

    // 3. Busca escola padrão
    const { data: escola } = await supabase.from("escolas").select("id").limit(1).single();

    // 4. Cria registro de aluno
    await supabase.from("alunos").insert({
      user_id: userId,
      escola_id: escola?.id ?? null,
      ra: form.ra,
      turma: form.turma,
      trabalha: form.trabalha,
      tipo_trabalho: form.trabalha ? form.tipoTrabalho : null,
      dias_trabalho: form.trabalha ? form.diasTrabalho : [],
      trabalho_entrada: form.trabalha ? form.horarioEntrada : null,
      trabalho_saida: form.trabalha ? form.horarioSaida : null,
    });

    router.push("/aluno/rotina");
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <button onClick={() => step === "conta" ? setStep("dados") : router.back()}
          className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </button>
        <h1 className="font-semibold text-slate-800">Cadastro</h1>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
          <span className="text-xs">👤</span>
        </div>
      </header>

      {/* Indicador de etapa */}
      <div className="flex px-4 py-3 gap-2">
        {["dados", "conta"].map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition ${step === s || (s === "dados") ? "bg-blue-600" : "bg-slate-200"} ${i === 1 && step === "dados" ? "bg-slate-200" : ""}`} />
        ))}
      </div>

      <form onSubmit={step === "dados" ? (e) => { e.preventDefault(); setStep("conta"); } : handleSubmit}
        className="px-4 py-4 flex flex-col gap-5 pb-10">

        {step === "dados" && (
          <>
            <p className="text-xs text-slate-500 font-medium">ETAPA 1 — Dados escolares</p>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Nome completo</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="João da Silva" required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">RA — Registro do Aluno</label>
              <input value={form.ra} onChange={(e) => setForm({ ...form, ra: e.target.value })}
                placeholder="Ex: 2024020123" required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Turma</label>
              <select value={form.turma} onChange={(e) => setForm({ ...form, turma: e.target.value })} required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecionar turma</option>
                {TURMAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Escola</label>
              <input value={form.escola} onChange={(e) => setForm({ ...form, escola: e.target.value })} required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Trabalha atualmente?</label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button key={String(val)} type="button" onClick={() => setForm({ ...form, trabalha: val })}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${form.trabalha === val ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"}`}>
                    {val ? "Sim" : "Não"}
                  </button>
                ))}
              </div>
            </div>

            {form.trabalha && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Tipo de trabalho</label>
                  <input value={form.tipoTrabalho} onChange={(e) => setForm({ ...form, tipoTrabalho: e.target.value })}
                    placeholder="Ex: Atendente, Auxiliar, Estagiário..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Dias que trabalha</label>
                  <div className="flex gap-2 flex-wrap">
                    {DIAS.map((dia) => (
                      <button key={dia.key} type="button" onClick={() => toggleDia(dia.key)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${form.diasTrabalho.includes(dia.key) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"}`}>
                        {dia.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Entrada no trabalho</label>
                    <input type="time" value={form.horarioEntrada} onChange={(e) => setForm({ ...form, horarioEntrada: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Saída do trabalho</label>
                    <input type="time" value={form.horarioSaida} onChange={(e) => setForm({ ...form, horarioSaida: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {step === "conta" && (
          <>
            <p className="text-xs text-slate-500 font-medium">ETAPA 2 — Criar conta de acesso</p>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com" required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="Mínimo 6 caracteres" required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Confirmar senha</label>
              <input type="password" value={form.confirmarSenha} onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                placeholder="Repita a senha" required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>
            )}
          </>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-base shadow-md flex items-center justify-center gap-2">
          {loading ? "Cadastrando..." : step === "dados" ? <>Continuar <ChevronRight size={18} /></> : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
