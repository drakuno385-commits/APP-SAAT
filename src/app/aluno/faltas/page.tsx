"use client";
import Link from "next/link";
import { ChevronRight, Calendar, AlertTriangle } from "lucide-react";
import { mockFaltas, getFaltasPorMateria } from "@/lib/mock-data";

export default function FaltasPage() {
  const faltas = mockFaltas;
  const faltasPorMateria = getFaltasPorMateria(faltas);
  const total = faltas.length;
  const limiteAlerta = 5;

  return (
    <div className="app-shell min-h-screen bg-white">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <Link href="/aluno/dashboard" className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </Link>
        <h1 className="font-semibold text-slate-800">Minhas faltas</h1>
        <button className="p-1 rounded-full hover:bg-slate-100">
          <Calendar size={20} className="text-slate-500" />
        </button>
      </header>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Matéria</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Faltas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {faltasPorMateria.map(({ materia, faltas: qtd }) => (
                <tr key={materia} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{materia}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className={`text-sm font-bold ${
                        qtd >= 2 ? "text-red-600" : qtd === 1 ? "text-yellow-600" : "text-slate-400"
                      }`}
                    >
                      {qtd}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50">
            <span className="text-sm font-bold text-slate-700">Total: {total} faltas</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                total >= limiteAlerta
                  ? "bg-red-100 text-red-700"
                  : total >= 2
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {total >= limiteAlerta ? "🔴 Alto" : total >= 2 ? "🟡 Atenção" : "🟢 Normal"}
            </span>
          </div>
        </div>

        {/* Alerta */}
        {total >= 2 && (
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 flex gap-3">
            <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Você está acumulando faltas.</p>
              <p className="text-xs text-yellow-700 mt-0.5">Converse com seu tutor para organizar sua rotina.</p>
            </div>
          </div>
        )}

        {/* Histórico individual */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Histórico de faltas</h2>
          <div className="flex flex-col gap-2">
            {faltas.map((f) => (
              <div key={f.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{f.materia}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(f.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {f.justificativa ? (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Justificada</span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Não justificada</span>
                )}
              </div>
            ))}
          </div>
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
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                item.href === "/aluno/faltas" ? "text-blue-600" : "text-slate-400"
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
