"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { createClient } from "@/lib/supabase/client";

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [distribuicao, setDistribuicao] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: alunosDB } = await supabase.from("alunos").select(`
        id, 
        faltas(count),
        notas(b1,b2,b3,b4)
      `);
      
      if(alunosDB) {
        setTotal(alunosDB.length);
        let normal = 0;
        let atencao = 0;
        let risco = 0;

        alunosDB.forEach(a => {
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
          
          if(pontos >= 2) risco++;
          else if(pontos === 1) atencao++;
          else normal++;
        });

        setDistribuicao([
          { name: "Normal", value: normal, color: "#16a34a" },
          { name: "Atenção", value: atencao, color: "#d97706" },
          { name: "Risco", value: risco, color: "#dc2626" },
        ]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const DIFICULDADES = [
    { desc: "Falta de tempo para estudar", qtd: 15 },
    { desc: "Cansaço", qtd: 12 },
    { desc: "Conflito entre trabalho e escola", qtd: 8 },
    { desc: "Faltas", qtd: 5 },
    { desc: "Atividades acumuladas", qtd: 3 },
  ];

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <header className="bg-white px-4 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-semibold text-slate-800">Painel da escola</h1>
        <div className="flex items-center gap-2">
          <select className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-600 focus:outline-none">
            <option>Este mês</option>
            <option>Último mês</option>
            <option>Este ano</option>
          </select>
        </div>
      </header>

      <div className="px-4 py-5 flex flex-col gap-5 pb-24">
        {loading ? (
          <p className="text-center text-slate-500 py-10">Calculando indicadores...</p>
        ) : (
          <>
            {/* Total */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
              <p className="text-xs text-slate-500 font-medium mb-1">Total de Alunos Matriculados</p>
              <p className="text-5xl font-black text-slate-800">{total}</p>
              <p className="text-sm text-slate-500 mt-1">no banco de dados</p>
            </div>

            {/* Gráfico de rosca */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">Distribuição por situação</p>
              {total === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">Nenhum dado para exibir.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={distribuicao}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5} dataKey="value"
                    >
                      {distribuicao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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

            {/* Lista simulada de dificuldades */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800">Principais Dificuldades Relatadas</h2>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Top 5</span>
              </div>
              <div className="space-y-4">
                {DIFICULDADES.map((item, idx) => {
                  const max = DIFICULDADES[0].qtd;
                  const pct = Math.round((item.qtd / max) * 100);
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium">{item.desc}</span>
                        <span className="text-slate-500">{item.qtd} alunos</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
