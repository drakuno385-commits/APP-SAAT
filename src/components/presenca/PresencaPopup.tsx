"use client";
import { useState, useEffect, useCallback } from "react";
import { MapPin, CheckCircle, AlertTriangle, X, Loader2 } from "lucide-react";
import { calcDistanceMeters } from "@/lib/utils";
import { Escola } from "@/lib/types";

interface PresencaPopupProps {
  escola: Escola;
}

type PresencaStatus = "idle" | "loading" | "dentro" | "fora" | "confirmada" | "justificando" | "finalizado";

export function PresencaPopup({ escola }: PresencaPopupProps) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<PresencaStatus>("idle");
  const [distancia, setDistancia] = useState<number | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [hojeConfirmado, setHojeConfirmado] = useState(false);

  // Verifica se está no horário de entrada (±15 minutos)
  const isHorarioEntrada = useCallback(() => {
    const now = new Date();
    const [hh, mm] = escola.horario_entrada.split(":").map(Number);
    const entradaMin = hh * 60 + mm;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return Math.abs(nowMin - entradaMin) <= 15;
  }, [escola.horario_entrada]);

  useEffect(() => {
    // Checa se já confirmou hoje
    const hoje = new Date().toDateString();
    const confirmadoHoje = localStorage.getItem(`presenca_${hoje}`);
    if (confirmadoHoje) {
      setHojeConfirmado(true);
      return;
    }

    // Em produção, verificar o horário real; no demo, mostra sempre para testar
    // Descomente para verificar horário real: if (!isHorarioEntrada()) return;
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, [isHorarioEntrada]);

  const verificarLocalizacao = useCallback(() => {
    setStatus("loading");

    if (!navigator.geolocation) {
      setStatus("fora");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = calcDistanceMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          escola.lat,
          escola.lng
        );
        setDistancia(Math.round(dist));
        setStatus(dist <= escola.raio_metros ? "dentro" : "fora");
      },
      () => {
        // Permissão negada ou erro
        setStatus("fora");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [escola]);

  function confirmarPresenca() {
    const hoje = new Date().toDateString();
    localStorage.setItem(`presenca_${hoje}`, "confirmada");
    setStatus("confirmada");
    setTimeout(() => {
      setShow(false);
      setHojeConfirmado(true);
    }, 2000);
  }

  function salvarJustificativa() {
    const hoje = new Date().toDateString();
    localStorage.setItem(`presenca_${hoje}`, `justificada: ${justificativa}`);
    setStatus("finalizado");
    setTimeout(() => {
      setShow(false);
      setHojeConfirmado(true);
    }, 2000);
  }

  function fecharSemConfirmar() {
    const hoje = new Date().toDateString();
    localStorage.setItem(`presenca_${hoje}`, "ausente");
    setShow(false);
  }

  if (!show || hojeConfirmado) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={fecharSemConfirmar}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl p-6 pb-8 animate-in slide-in-from-bottom-4">
        {/* Fechar */}
        <button
          onClick={fecharSemConfirmar}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X size={18} className="text-slate-400" />
        </button>

        {/* Estado: idle */}
        {status === "idle" && (
          <>
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin size={28} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Confirmar presença</h2>
                <p className="text-slate-500 text-sm mt-1">
                  São {escola.horario_entrada} — hora de confirmar que você está na escola!
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-2 text-sm text-slate-600 w-full">
                📍 {escola.nome}
              </div>
            </div>
            <button
              onClick={verificarLocalizacao}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <MapPin size={18} />
              Confirmar com GPS
            </button>
            <button
              onClick={() => setStatus("justificando")}
              className="w-full mt-2 text-slate-500 text-sm py-2 hover:text-slate-700 transition"
            >
              Vou justificar minha falta
            </button>
          </>
        )}

        {/* Estado: carregando GPS */}
        {status === "loading" && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">Verificando sua localização...</p>
          </div>
        )}

        {/* Estado: dentro do raio */}
        {status === "dentro" && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-green-700 text-lg">Você está na escola! ✅</h2>
              <p className="text-slate-500 text-sm mt-1">
                Distância: {distancia}m (raio: {escola.raio_metros}m)
              </p>
            </div>
            <button
              onClick={confirmarPresenca}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition"
            >
              Confirmar presença
            </button>
          </div>
        )}

        {/* Estado: fora do raio */}
        {status === "fora" && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="font-bold text-yellow-700 text-lg">Você não está na escola</h2>
              <p className="text-slate-500 text-sm mt-1">
                {distancia !== null
                  ? `Você está a ${distancia}m da escola (raio: ${escola.raio_metros}m)`
                  : "Não foi possível verificar sua localização."}
              </p>
            </div>
            <button
              onClick={() => setStatus("justificando")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 rounded-xl transition"
            >
              Justificar ausência
            </button>
            <button
              onClick={fecharSemConfirmar}
              className="w-full text-slate-400 text-sm py-1 hover:text-slate-600"
            >
              Fechar (registrar como ausente)
            </button>
          </div>
        )}

        {/* Estado: justificando */}
        {status === "justificando" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-slate-800 text-lg">Justificar falta</h2>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva o motivo da sua ausência (trabalho, saúde, etc.)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <button
              onClick={salvarJustificativa}
              disabled={!justificativa.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition"
            >
              Enviar justificativa
            </button>
          </div>
        )}

        {/* Estado: confirmada */}
        {(status === "confirmada" || status === "finalizado") && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-green-700 text-lg">
                {status === "confirmada" ? "Presença confirmada! 🎉" : "Justificativa enviada! 📝"}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {status === "confirmada"
                  ? "Sua presença foi registrada com sucesso."
                  : "Sua justificativa foi enviada ao tutor."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
