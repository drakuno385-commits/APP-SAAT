"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TURMAS = ["1º Ano A", "1º Ano B", "1º Ano C", "1º Ano D", "1º Ano E", "2º TA", "2º TB", "2º TC", "2º TD", "2º TE", "3º TA", "3º TB", "3º TC", "3º TD", "3º TE"];
const DIAS = [
  { key: "seg", label: "Segunda" }, { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" }, { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" }, { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<"perfil" | "dados" | "conta">("perfil");
  const [perfil, setPerfil] = useState<"aluno" | "tutor" | "gestor">("aluno");

  const [form, setForm] = useState({
    nome: "", ra: "", turma: "", escola: "EE Prof. Eurípedes Simões de Paula", tutor_id: "",
    trabalha: true, tipoTrabalho: "Atendente",
    diasTrabalho: ["seg", "ter", "qua", "qui", "sex"] as string[],
    horarioEntrada: "08:00", horarioSaida: "12:00",
    disciplina: "", cargo: "",
    email: "", senha: "", confirmarSenha: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tutores, setTutores] = useState<any[]>([]);

  useEffect(() => {
    async function carregarTutores() {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("id, nome").eq("role", "tutor");
      if (data) setTutores(data);
    }
    carregarTutores();
  }, []);

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
    if (perfil === "aluno" && !form.tutor_id && tutores.length > 0) { setError("Selecione um tutor orientador."); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();

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

    // 2. Cria profile com o role correto
    await supabase.from("profiles").upsert({ id: userId, role: perfil, nome: form.nome });

    if (perfil === "aluno") {
      // 3. Busca escola
      const { data: escola } = await supabase.from("escolas").select("id").limit(1).single();

      // 4. Cria aluno
      await supabase.from("alunos").insert({
        user_id: userId,
        escola_id: escola?.id ?? null,
        tutor_id: form.tutor_id || null,
        matricula: form.ra,
        turma: form.turma,
        trabalha: form.trabalha,
        tipo_trabalho: form.trabalha ? form.tipoTrabalho : null,
        trabalho_entrada: form.trabalha ? form.horarioEntrada : null,
        trabalho_saida: form.trabalha ? form.horarioSaida : null,
      });
      router.push("/aluno/dashboard");
      router.refresh();
    } else if (perfil === "tutor") {
      router.push("/tutor/painel");
      router.refresh();
    } else {
      router.push("/gestor/relatorios");
      router.refresh();
    }
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50 flex flex-col">
      <header className="px-4 py-4 bg-white border-b border-slate-200 flex items-center justify-center">
        <h1 className="font-black text-blue-600 text-xl tracking-tight">SAAT <span className="text-slate-800 font-bold">Cadastro</span></h1>
      </header>

      <div className="flex px-4 py-4 gap-2 bg-white shadow-sm">
        {["perfil", "dados", "conta"].map((s, i) => {
          const isActive = step === s;
          const isPast = (step === "dados" && s === "perfil") || (step === "conta" && (s === "perfil" || s === "dados"));
          return (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition ${isActive || isPast ? "bg-blue-600" : "bg-slate-200"}`} />
          )
        })}
      </div>

      <form onSubmit={step === "perfil" ? (e) => { e.preventDefault(); setStep("dados"); } : step === "dados" ? (e) => { e.preventDefault(); setStep("conta"); } : handleSubmit}
        className="px-4 py-6 flex flex-col gap-6 pb-10">

        {step === "perfil" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Qual é o seu perfil na escola?</h2>
            <div className="flex flex-col gap-3">
              {[
                { id: "aluno", title: "Aluno(a)", desc: "Quero acompanhar minhas notas e rotina de trabalho." },
                { id: "tutor", title: "Professor / Tutor", desc: "Quero orientar alunos e lançar acompanhamentos." },
                { id: "gestor", title: "Diretor / Gestor", desc: "Quero ver os relatórios e indicadores da escola." }
              ].map(p => (
                <div key={p.id} onClick={() => setPerfil(p.id as any)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer ${perfil === p.id ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${perfil === p.id ? "border-blue-600" : "border-slate-300"}`}>
                      {perfil === p.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                      <h3 className={`font-bold ${perfil === p.id ? "text-blue-800" : "text-slate-700"}`}>{p.title}</h3>
                      <p className={`text-xs mt-0.5 ${perfil === p.id ? "text-blue-600" : "text-slate-500"}`}>{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "dados" && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-500 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Preencha seus dados</h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Nome completo</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: João da Silva" required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Escola</label>
              <input value={form.escola} disabled required
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm focus:outline-none text-slate-500" />
            </div>

            {perfil === "aluno" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">Tutor Orientador</label>
                  <select value={form.tutor_id} onChange={(e) => setForm({ ...form, tutor_id: e.target.value })} required={tutores.length > 0}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione seu tutor</option>
                    {tutores.map((t) => <option key={t.id} value={t.id}>Prof. {t.nome}</option>)}
                  </select>
                  {tutores.length === 0 && <p className="text-xs text-amber-600 mt-1">Nenhum tutor cadastrado ainda. Opcional.</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">RA - Registro do Aluno</label>
                  <input value={form.ra} onChange={(e) => setForm({ ...form, ra: e.target.value })}
                    placeholder="Ex: 2024020123" required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">Turma</label>
                  <select value={form.turma} onChange={(e) => setForm({ ...form, turma: e.target.value })} required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecionar turma</option>
                    {TURMAS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm font-semibold text-slate-700">Você trabalha atualmente?</label>
                  <div className="flex gap-3">
                    {[true, false].map((val) => (
                      <button key={String(val)} type="button" onClick={() => setForm({ ...form, trabalha: val })}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition ${form.trabalha === val ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-600 border-slate-200"}`}>
                        {val ? "Sim, eu trabalho" : "Não trabalho"}
                      </button>
                    ))}
                  </div>
                </div>

                {form.trabalha && (
                  <div className="p-4 bg-slate-100 rounded-2xl flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-700">Tipo de trabalho</label>
                      <input value={form.tipoTrabalho} onChange={(e) => setForm({ ...form, tipoTrabalho: e.target.value })}
                        placeholder="Ex: Atendente, Auxiliar, Menor Aprendiz..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">Dias que trabalha</label>
                      <div className="flex gap-2 flex-wrap">
                        {DIAS.map((dia) => (
                          <button key={dia.key} type="button" onClick={() => toggleDia(dia.key)}
                            className={`px-3 py-2 rounded-lg border text-xs font-bold transition ${form.diasTrabalho.includes(dia.key) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"}`}>
                            {dia.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700">Entrada</label>
                        <input type="time" value={form.horarioEntrada} onChange={(e) => setForm({ ...form, horarioEntrada: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700">Saída</label>
                        <input type="time" value={form.horarioSaida} onChange={(e) => setForm({ ...form, horarioSaida: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {perfil === "tutor" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Disciplina / Especialidade</label>
                <input value={form.disciplina} onChange={(e) => setForm({ ...form, disciplina: e.target.value })}
                  placeholder="Ex: Matemática, Orientador Pedagógico..." required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            {perfil === "gestor" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Cargo</label>
                <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  placeholder="Ex: Diretor, Vice-Diretor, Coordenador..." required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
        )}

        {step === "conta" && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-500 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Crie sua senha de acesso</h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com" required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="Mínimo 6 caracteres" required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Confirmar senha</label>
              <input type="password" value={form.confirmarSenha} onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                placeholder="Repita a senha" required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-3 pt-4 border-t border-slate-100">
          {step !== "perfil" && (
            <button type="button" 
              onClick={() => setStep(step === "conta" ? "dados" : "perfil")}
              className="py-3.5 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition">
              Voltar
            </button>
          )}
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-base shadow-md shadow-blue-200 flex items-center justify-center gap-2">
            {loading ? "Processando..." : step !== "conta" ? <>Próximo passo <ChevronRight size={18} /></> : "Finalizar Cadastro"}
          </button>
        </div>
      </form>
    </div>
  );
}
