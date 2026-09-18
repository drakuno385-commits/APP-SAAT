"use client";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const DISTRIBUICAO = [
  { name: "Normal", value: 20, color: "#16a34a" },
  { name: "Atenção", value: 19, color: "#d97706" },
  { name: "Risco", value: 6, color: "#dc2626" },
];

const DIFICULDADES = [
  { desc: "Falta de tempo para estudar", qtd: 35 },
  { desc: "Cansaço", qtd: 28 },
  { desc: "Conflito entre trabalho e escola", qtd: 20 },
  { desc: "Faltas", qtd: 18 },
  { desc: "Atividades acumuladas", qtd: 15 },
];

const TOTAL = DISTRIBUICAO.reduce((acc, d) => acc + d.value, 0);

export default function RelatoriosPage() {
  return (
    <div className="app-shell min-h-screen bg-slate-50">
      {/* Header */}
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
        {/* Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-medium mb-1">Situação dos alunos trabalhadores</p>
          <p className="text-5xl font-black text-slate-800">{TOTAL}</p>
          <p className="text-sm text-slate-500 mt-1">alunos trabalhadores</p>
        </div>

        {/* Gráfico de rosca */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Distribuição por situação</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={DISTRIBUICAO}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {DISTRIBUICAO.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} alunos`, ""]} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span className="text-xs text-slate-600">
                    {value}: {(entry.payload as { value: number }).value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda manual */}
          <div className="flex justify-center gap-4 mt-2">
            {DISTRIBUICAO.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-slate-600">{d.value} {d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Principais dificuldades */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">Principais dificuldades</p>
          <div className="flex flex-col gap-3">
            {DIFICULDADES.map((d, i) => (
              <div key={d.desc}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono w-4">{i + 1}.</span>
                    <span className="text-sm text-slate-700">{d.desc}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{d.qtd}</span>
                </div>
                <div className="ml-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(d.qtd / 45) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link para cadastro da escola */}
        <Link href="/gestor/escola">
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-sm font-semibold text-blue-800">Configurar escola</p>
              <p className="text-xs text-blue-600 mt-0.5">Geolocalização e horários</p>
            </div>
            <span className="text-2xl">📍</span>
          </div>
        </Link>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/gestor/relatorios", label: "Relatórios", icon: "📊" },
            { href: "/gestor/alunos", label: "Alunos", icon: "👥" },
            { href: "/gestor/escola", label: "Escola", icon: "🏫" },
            { href: "/gestor/perfil", label: "Perfil", icon: "👤" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                item.href === "/gestor/relatorios" ? "text-blue-600" : "text-slate-400"
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
