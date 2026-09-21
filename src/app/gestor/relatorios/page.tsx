"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Users, AlertTriangle, GraduationCap, ArrowUpRight, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { createClient } from "@/lib/supabase/client";

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [distribuicao, setDistribuicao] = useState<any[]>([]);
  const [tutores, setTutores] = useState<any[]>([]);
  const [topRiscos, setTopRiscos] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      
      const { data: alunosDB } = await supabase.from("alunos").select("id, tutor_id, tutor_status, matricula, profiles!inner(nome), faltas(count), notas(b1,b2,b3,b4)");
      
      let normal = 0, atencao = 0, risco = 0;
      const alunosCalc = (alunosDB || []).map((a: any) => {
        const faltasCount = a.faltas?.[0]?.count || 0;
        let soma = 0; let qtd = 0;
        if(a.notas) {
          a.notas.forEach((n: any) => {
            if(n.b1 !== null) {soma += n.b1; qtd++;}
            if(n.b2 !== null) {soma += n.b2; qtd++;}
            if(n.b3 !== null) {soma += n.b3; qtd++;}
            if(n.b4 !== null) {soma += n.b4; qtd++;}
          });
        }
        const media = qtd > 0 ? soma/qtd : 0;
        let pontos = 0;
        if (faltasCount > 5) pontos++;
        if (media > 0 && media < 6) pontos++;
        
        let status = "normal";
        if(pontos >= 2) status = "risco";
        else if(pontos === 1) status = "atencao";
        
        if (status === "risco") risco++;
        else if (status === "atencao") atencao++;
        else normal++;

        return { ...a, status, faltasCount, media, nome: a.profiles?.nome };
      });

      setTotal(alunosDB?.length || 0);
      setDistribuicao([
        { name: "Normal", value: normal, color: "#16a34a" },
        { name: "Atenção", value: atencao, color: "#d97706" },
        { name: "Risco", value: risco, color: "#dc2626" },
      ]);

      const emRisco = alunosCalc.filter(a => a.status === "risco" || a.status === "atencao");
      emRisco.sort((a, b) => {
          if (a.status === "risco" && b.status !== "risco") return -1;
          if (b.status === "risco" && a.status !== "risco") return 1;
          return b.faltasCount - a.faltasCount;
      });
      setTopRiscos(emRisco.slice(0, 5));

      const { data: tutoresProfiles } = await supabase.from("profiles").select("*").eq("role", "tutor");
      
      if (tutoresProfiles) {
        const tutoresStats = tutoresProfiles.map((t: any) => {
          const alunosDoTutor = alunosCalc.filter((a: any) => a.tutor_id === t.id && a.tutor_status === "aprovado");
          const tTotal = alunosDoTutor.length;
          const tNormal = alunosDoTutor.filter((a: any) => a.status === "normal").length;
          const tAtencao = alunosDoTutor.filter((a: any) => a.status === "atencao").length;
          const tRisco = alunosDoTutor.filter((a: any) => a.status === "risco").length;

          return {
            id: t.id,
            nome: t.nome,
            total: tTotal,
            pctNormal: tTotal > 0 ? Math.round((tNormal / tTotal) * 100) : 0,
            pctAtencao: tTotal > 0 ? Math.round((tAtencao / tTotal) * 100) : 0,
            pctRisco: tTotal > 0 ? Math.round((tRisco / tTotal) * 100) : 0,
          };
        });
        setTutores(tutoresStats);
      }

      setLoading(false);
    }
    load();
  }, []);

  const totalEmRisco = distribuicao.find(d => d.name === "Risco")?.value || 0;

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="bg-white px-4 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-semibold text-slate-800">Painel da escola</h1>
        <div className="flex items-center gap-2">
          <select className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-600 focus:outline-none">
            <option>Visão Geral</option>
          </select>
        </div>
      </header>

      <div className="px-4 py-5 flex flex-col gap-5 pb-24">
        {loading ? (
          <p className="text-center text-slate-500 py-10">Calculando indicadores...</p>
        ) : (
          <>
            {/* Mtricas Gerais (Kpis) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alunos</p>
                  <GraduationCap size={16} className="text-indigo-600" />
                </div>
                <p className="text-2xl font-black text-slate-800">{total}</p>
              </div>
              
              <div className="bg-red-50 border border-red-100 shadow-sm rounded-2xl p-4 flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Em Risco</p>
                  <AlertTriangle size={16} className="text-red-600" />
                </div>
                <p className="text-2xl font-black text-red-700">{totalEmRisco}</p>
              </div>
            </div>

            {/* Configuraes da Escola */}
            <Link href="/gestor/escola" className="bg-purple-600 rounded-2xl p-5 border border-purple-500 shadow-md flex items-center justify-between hover:bg-purple-700 transition">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Configurações da Escola</h2>
                <p className="text-purple-200 text-xs">Horários de aula e endereço GPS</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/50 rounded-full flex items-center justify-center">
                <MapPin size={24} className="text-white" />
              </div>
            </Link>

            {/* Grfico de rosca geral */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">Saúde Geral dos Alunos</p>
              {total === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">Nenhum dado para exibir.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={distribuicao}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={70}
                      paddingAngle={5} dataKey="value"
                    >
                      {distribuicao.map((entry, index) => (
                        <Cell key={cell-+index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              <div className="flex justify-center gap-4 mt-2">
                {distribuicao.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-slate-600 font-medium">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Alunos em Risco */}
            {topRiscos.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  Alunos Precisando de Atenção
                </h2>
                
                <div className="flex flex-col gap-2">
                  {topRiscos.map(a => (
                    <div key={a.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={"w-2 h-10 rounded-full " + (a.status === 'risco' ? 'bg-red-500' : 'bg-amber-500')}></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{a.nome || "Sem Nome"}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {a.faltasCount} {a.faltasCount === 1 ? 'falta' : 'faltas'} • Média {a.media > 0 ? a.media.toFixed(1) : '--'}
                                </p>
                            </div>
                        </div>
                        <Link href="/gestor/alunos" className="bg-slate-50 p-2 rounded-full text-slate-500 hover:text-indigo-600">
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Tutores */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-3 mt-2 flex items-center gap-2">
                <Users size={18} className="text-purple-600" />
                Desempenho da Equipe de Tutores
              </h2>
              
              {tutores.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-6 bg-white rounded-xl border border-slate-100">Nenhum tutor cadastrado no sistema.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tutores.map(t => (
                    <Link key={t.id} href={/gestor/tutor/+t.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm block hover:border-purple-300 transition">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-bold text-slate-800">{t.nome}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{t.total} alunos sob tutoria</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                      </div>
                      
                      {t.total === 0 ? (
                        <p className="text-xs text-slate-400">Sem alunos aprovados ainda.</p>
                      ) : (
                        <div className="flex h-3 w-full rounded-full overflow-hidden">
                          {t.pctNormal > 0 && <div style={{ width: t.pctNormal + '%' }} className="bg-green-600 h-full" title={Normal: +t.pctNormal+%} />}
                          {t.pctAtencao > 0 && <div style={{ width: t.pctAtencao + '%' }} className="bg-amber-500 h-full" title={Atenção: +t.pctAtencao+%} />}
                          {t.pctRisco > 0 && <div style={{ width: t.pctRisco + '%' }} className="bg-red-600 h-full" title={Risco: +t.pctRisco+%} />}
                        </div>
                      )}
                      
                      {t.total > 0 && (
                        <div className="flex justify-between text-[10px] font-bold mt-2">
                          <span className="text-green-700">{t.pctNormal}% Bons</span>
                          <span className="text-amber-600">{t.pctAtencao}% Em Atenção</span>
                          <span className="text-red-700">{t.pctRisco}% Críticos</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}