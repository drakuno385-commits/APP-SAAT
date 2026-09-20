"use client";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { mockAtividades } from "@/lib/mock-data";

const MATERIA_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Matemática": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  "Português":  { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "História":   { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  "Cincias":   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "Geografia":  { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  "Ingls":     { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
};

export default function AtividadesPage() {
  const pendentes = mockAtividades.filter((a) => a.status === "pendente");
  const concluidas = mockAtividades.filter((a) => a.status === "concluida");

  return (
    <div className="app-shell min-h-screen bg-white">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <Link href="/aluno/dashboard" className="p-1 rounded-full hover:bg-slate-100">
          <ChevronRight size={20} className="text-slate-600 rotate-180" />
        </Link>
        <h1 className="font-semibold text-slate-800">Contedos pendentes</h1>
        <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">
          {pendentes.length} pendentes
        </span>
      </header>

      <div className="px-4 py-5 flex flex-col gap-3 pb-24">
        {/* Pendentes */}
        {pendentes.length > 0 && (
          <div className="flex flex-col gap-3">
            {pendentes.map((a) => {
              const colors = MATERIA_COLORS[a.materia] ?? { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400" };
              return (
                <div key={a.id} className={`rounded-2xl p-4 border border-slate-100 ${colors.bg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${colors.dot}`} />
                      <span className={`text-sm font-bold ${colors.text}`}>{a.materia}</span>
                    </div>
                    {a.conteudo_url && (
                      <a
                        href={a.conteudo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline flex-shrink-0"
                      >
                        Ver contedo <ExternalLink size={12} />
                      </a>
                    )}
                    {!a.conteudo_url && (
                      <button className="text-xs text-blue-600 font-medium hover:underline flex-shrink-0">
                        Ver contedo
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 ml-4">{a.tipo}</p>
                  <p className="text-xs text-slate-400 ml-4 mt-1">
                    Data: {new Date(a.data).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="ml-4 mt-2 flex items-center gap-1.5">
                    <span className="text-red-500 text-xs"></span>
                    <span className="text-xs text-red-600 font-semibold">Pendente</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Concludas */}
        {concluidas.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-slate-500 mt-2">Concludas</h2>
            {concluidas.map((a) => {
              const colors = MATERIA_COLORS[a.materia] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
              return (
                <div key={a.id} className="rounded-2xl p-4 border border-slate-100 bg-slate-50 opacity-60">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                    <span className={`text-sm font-bold ${colors.text}`}>{a.materia}</span>
                  </div>
                  <p className="text-sm text-slate-600 ml-4">{a.tipo}</p>
                  <div className="ml-4 mt-2 flex items-center gap-1.5">
                    <span className="text-green-500 text-xs"></span>
                    <span className="text-xs text-green-600 font-semibold">Concluda</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/aluno/dashboard", label: "Início", icon: "" },
            { href: "/aluno/faltas", label: "Faltas", icon: "" },
            { href: "/aluno/atividades", label: "Atividades", icon: "" },
            { href: "/aluno/tutor", label: "Tutor", icon: "" },
            { href: "/aluno/perfil", label: "Perfil", icon: "" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                item.href === "/aluno/atividades" ? "text-blue-600" : "text-slate-400"
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
