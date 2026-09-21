"use client";
import { useState, useEffect } from "react";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { calcDistanceMeters } from "@/lib/utils";
import { Escola } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface PresencaPopupProps {
  escola: Escola;
}

export function PresencaPopup({ escola }: PresencaPopupProps) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [distancia, setDistancia] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const horarioEntrada = escola.horario_entrada ? escola.horario_entrada.substring(0, 5) : "14:15";

  useEffect(() => {
    const dataHoje = new Date().toISOString().split("T")[0];
    const jaApareceuHoje = localStorage.getItem("popup_visto_" + dataHoje);

    if (!jaApareceuHoje) {
      // Verifica se j passou do horrio de entrada
      const agora = new Date();
      const horaAtual = agora.getHours();
      const minutoAtual = agora.getMinutes();
      
      const [hEntrada, mEntrada] = horarioEntrada.split(":").map(Number);
      
      const jaPassou = horaAtual > hEntrada || (horaAtual === hEntrada && minutoAtual >= mEntrada);

      if (jaPassou) {
        const t = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [horarioEntrada]);

  function marcarComoVisto() {
    const dataHoje = new Date().toISOString().split("T")[0];
    localStorage.setItem("popup_visto_" + dataHoje, "true");
  }

  async function confirmarPresenca() {
    setStatus("loading");
    setMsg("Obtendo sua localização...");

    if (!navigator.geolocation) {
      setStatus("error");
      setMsg("Geolocalização não suportada no seu dispositivo.");
      marcarComoVisto();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latAluno = pos.coords.latitude;
        const lngAluno = pos.coords.longitude;
        
        const latEscola = escola.lat || -23.5505;
        const lngEscola = escola.lng || -46.6333;
        const raio = escola.raio_metros || 100;

        const dist = calcDistanceMeters(latEscola, lngEscola, latAluno, lngAluno);
        setDistancia(Math.round(dist));

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (dist <= raio) {
          setStatus("success");
          setMsg("Presença confirmada com sucesso!");
          
          if (session?.user) {
            const { data: alunoInfo } = await supabase.from("alunos").select("id").eq("user_id", session.user.id).single();
            if (alunoInfo) {
              await supabase.from("presencas").insert({
                aluno_id: alunoInfo.id,
                escola_id: escola.id,
                data: new Date().toISOString().split("T")[0],
                status: "confirmada",
                lat_aluno: latAluno,
                lng_aluno: lngAluno,
                dentro_do_raio: true
              });
            }
          }
          
          marcarComoVisto();
          setTimeout(() => setShow(false), 3000);
        } else {
          setStatus("error");
          setMsg("Você está fora da escola!");
          
          if (session?.user) {
            const { data: alunoInfo } = await supabase.from("alunos").select("id").eq("user_id", session.user.id).single();
            if (alunoInfo) {
              await supabase.from("faltas").insert({
                aluno_id: alunoInfo.id,
                materia: "Geral (Falta de Presença)",
                data: new Date().toISOString().split("T")[0],
              });
            }
          }
          marcarComoVisto();
        }
      },
      (err) => {
        setStatus("error");
        setMsg(err.message === "User denied Geolocation" 
          ? "Você negou o acesso à localização." 
          : "Não foi possível verificar sua localização.");
        marcarComoVisto();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function fecharPopup() {
    marcarComoVisto();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="bg-blue-600 p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <MapPin size={32} className="text-white" />
          </div>
          <h2 className="text-white font-bold text-xl">Confirmação de Presença</h2>
          <p className="text-blue-100 text-sm mt-1">
            São {horarioEntrada} - O período de aula iniciou! Confirme que você está na escola.
          </p>
        </div>

        <div className="p-6 flex flex-col items-center text-center bg-white">
          {status === "idle" && (
            <>
              <p className="text-slate-600 text-sm mb-6">
                Precisamos acessar o GPS do seu celular para validar se você está dentro da escola.
              </p>
              <button
                onClick={confirmarPresenca}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition"
              >
                Confirmar Presença Agora
              </button>
              <button
                onClick={fecharPopup}
                className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-xl transition"
              >
                Agora não
              </button>
            </>
          )}

          {status === "loading" && (
            <div className="py-4 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-600 font-medium">{msg}</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-2 flex flex-col items-center gap-3">
              <CheckCircle size={48} className="text-green-500" />
              <h2 className="font-bold text-green-600 text-lg">{msg}</h2>
              {distancia !== null && (
                <p className="text-xs text-slate-500">
                  Distância: {distancia}m (raio: {escola.raio_metros || 100}m)
                </p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="py-2 flex flex-col items-center gap-3">
              <XCircle size={48} className="text-red-500" />
              <h2 className="font-bold text-red-600 text-lg">Você não está na escola</h2>
              <p className="text-slate-600 text-sm">{msg}</p>
              <p className="text-xs text-red-500 font-bold mt-2">Uma FALTA foi registrada e precisa de justificativa com seu Tutor.</p>
              <button
                onClick={fecharPopup}
                className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}