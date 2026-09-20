"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TURMAS = ["1A", "1B", "1C", "1D", "1E", "2TA", "2TB", "2TC", "2D", "3TA", "3TB", "3TC", "3D"];
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

  const perfis = [
    { id: "aluno", icon: "👨‍🎓", title: "Sou Aluno", desc: "Acompanhar notas, faltas e atividades." },
    { id: "tutor", icon: "👨‍🏫", title: "Professor / Tutor", desc: "Acompanhar alunos e aprovar solicitações." },
    { id: "gestor", icon: "👔", title: "Sou Gestor", desc: "Visão geral da escola." },
  ];

  function validateStep() {
    if (step === "dados") {
      if (!form.nome.trim()) { setError("Preencha seu nome completo."); return false; }
      if (perfil === "aluno" && (!form.ra || !form.turma)) {
        setError("RA e Turma são obrigatórios para alunos."); return false;
      }
    }
    setError(""); return true;
  }

  function toggleDia(dia: string) {
    setForm(prev => ({
      ...prev,
      diasTrabalho: prev.diasTrabalho.includes(dia)
        ? prev.diasTrabalho.filter(d => d !== dia)
        : [...prev.diasTrabalho, dia]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.senha !== form.confirmarSenha) { setError("As senhas não coincidem."); return; }
    if (form.senha.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. Cria o usuário de autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { data: { nome: form.nome, role: perfil } },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Erro ao criar conta. Tente outro e-mail.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("saat_session_active", "true");
    const userId = authData.user.id;

    // 2. Cria profile com o role correto
    await supabase.from("profiles").upsert({ id: userId, role: perfil, nome: form.nome });

    if (perfil === "aluno") {
      // 3. Busca escola com fallback (não trava se a tabela estiver vazia)
      let escola = null;
      try {
        const { data } = await supabase.from("escolas").select("id").limit(1).single();
        escola = data;
      } catch(e) {}

      // 4. Cria aluno
      const { error: errAluno } = await supabase.from("alunos").insert({
        user_id: userId,
        escola_id: escola?.id ?? null,
        ra: form.ra,
        turma: form.turma,
        trabalha: form.trabalha,
        tipo_trabalho: form.trabalha ? form.tipoTrabalho : null,
        trabalho_entrada: form.trabalha ? form.horarioEntrada : null,
        trabalho_saida: form.trabalha ? form.horarioSaida : null,
      });

      if (errAluno) {
        setError("ERRO NO BANCO (Mande isso para mim): " + errAluno.message);
        setLoading(false);
        return;
      }

      router.push("/aluno/dashboard");
    } else if (perfil === "tutor") {
      router.push("/tutor/painel");
    } else {
      router.push("/gestor/relatorios");
    }
    
    router.refresh();
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50 flex flex-col">
      <header className="pt-12 pb-6 px-6 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
            🎓
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Criar Conta</h1>
        </div>
        <p className="text-slate-500 text-sm mt-2">Siga os passos para criar seu acesso ao SAAT.</p>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mt-6">
          <div className={`h-1.5 flex-1 rounded-full ${step === "perfil" ? "bg-blue-600" : "bg-blue-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step === "dados" ? "bg-blue-600" : "bg-slate-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step === "conta" ? "bg-blue-600" : "bg-slate-200"}`} />
        </div>
      </header>

      <div className="flex-1 p-6 pb-24 overflow-y-auto">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {/* STEP 1: PERFIL */}
        {step === "perfil" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quem é você?</h2>
            <div className="space-y-3">
              {perfis.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setPerfil(p.id as any)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                    perfil === p.id ? "border-blue-600 bg-blue-50/50 shadow-md" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${
                    perfil === p.id ? "bg-blue-100" : "bg-slate-100"
                  }`}>
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${perfil === p.id ? "text-blue-700" : "text-slate-700"}`}>{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    perfil === p.id ? "border-blue-600" : "border-slate-300"
                  }`}>
                    {perfil === p.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => { setError(""); setStep("dados"); }}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: DADOS PESSOAIS */}
        {step === "dados" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Seus Dados</h2>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
              <input 
                type="text" 
                value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                placeholder="Ex: João da Silva"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {perfil === "aluno" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">RA</label>
                    <input 
                      type="text" 
                      value={form.ra} onChange={e => setForm({...form, ra: e.target.value})}
                      placeholder="000.000.000-0"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Turma</label>
                    <select 
                      value={form.turma} onChange={e => setForm({...form, turma: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Escola Destino</label>
                  <input 
                    type="text" 
                    value={form.escola}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-500 font-medium"
                  />
                  <p className="text-xs text-slate-400">Escola pré-selecionada pelo sistema.</p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800">Você trabalha?</h3>
                      <p className="text-xs text-slate-500">Para ajustar sua rotina de estudos</p>
                    </div>
                    <button 
                      onClick={() => setForm({...form, trabalha: !form.trabalha})}
                      className={`w-14 h-8 rounded-full transition-colors relative ${form.trabalha ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${form.trabalha ? "left-7" : "left-1"}`} />
                    </button>
                  </div>

                  {form.trabalha && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Profissão / Cargo</label>
                        <input 
                          type="text" 
                          value={form.tipoTrabalho} onChange={e => setForm({...form, tipoTrabalho: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Dias de Trabalho</label>
                        <div className="flex flex-wrap gap-2">
                          {DIAS.map(dia => (
                            <button
                              key={dia.key}
                              onClick={() => toggleDia(dia.key)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                form.diasTrabalho.includes(dia.key) 
                                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                                : "bg-white text-slate-500 border border-slate-200"
                              }`}
                            >
                              {dia.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Entrada</label>
                          <input 
                            type="time" 
                            value={form.horarioEntrada} onChange={e => setForm({...form, horarioEntrada: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Saída</label>
                          <input 
                            type="time" 
                            value={form.horarioSaida} onChange={e => setForm({...form, horarioSaida: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => { setError(""); setStep("perfil"); }}
                className="w-14 h-14 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center shrink-0"
              >
                Voltar
              </button>
              <button 
                onClick={() => { if(validateStep()) { setStep("conta"); } }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LOGIN E SENHA */}
        {step === "conta" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Dados de Acesso</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">E-mail</label>
                <input 
                  type="email" 
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Criar Senha</label>
                <input 
                  type="password" 
                  value={form.senha} onChange={e => setForm({...form, senha: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Confirmar Senha</label>
                <input 
                  type="password" 
                  value={form.confirmarSenha} onChange={e => setForm({...form, confirmarSenha: e.target.value})}
                  placeholder="Digite a senha novamente"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { setError(""); setStep("dados"); }}
                  className="w-14 h-14 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center shrink-0"
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-200"
                >
                  {loading ? "Criando conta..." : "Finalizar Cadastro"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
