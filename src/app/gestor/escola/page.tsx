"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Loader2, CheckCircle, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";

// Carrega o mapa apenas no cliente (SSR incompatível com Leaflet)
const MapaEscola = dynamic(() => import("@/components/gestor/MapaEscola"), { ssr: false });

export default function EscolaCadastroPage() {
  const [form, setForm] = useState({
    nome: "EE Professora Maria Aparecida",
    endereco: "Rua das Flores, 123 - São Paulo, SP",
    horarioEntrada: "07:00",
    horarioSaida: "16:00",
    raio: 100,
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [capturando, setCapturando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const capturarGPS = useCallback(() => {
    setCapturando(true);
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada neste navegador.");
      setCapturando(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCapturando(false);
      },
      () => {
        // Usa coordenadas de São Paulo como fallback para demo
        setCoords({ lat: -23.5505, lng: -46.6333 });
        setCapturando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) { alert("Capture a geolocalização primeiro!"); return; }
    setSalvo(true);
    localStorage.setItem("saat_escola", JSON.stringify({ ...form, ...coords }));
  }

  return (
    <div className="app-shell min-h-screen bg-white">
      {/* TopBar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <Link href="/gestor/relatorios" className="p-1 rounded-full hover:bg-slate-100">
          ←
        </Link>
        <h1 className="font-semibold text-slate-800">Configurar escola</h1>
        <div className="w-8" />
      </header>

      <form onSubmit={handleSalvar} className="px-4 py-5 flex flex-col gap-5 pb-10">
        {/* Dados básicos */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Nome da escola</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Endereço</label>
            <input
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Entrada das aulas</label>
              <input
                type="time"
                value={form.horarioEntrada}
                onChange={(e) => setForm({ ...form, horarioEntrada: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Saída das aulas</label>
              <input
                type="time"
                value={form.horarioSaida}
                onChange={(e) => setForm({ ...form, horarioSaida: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Geolocalização */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Geolocalização da escola</span>
          </div>
          <p className="text-xs text-blue-600 mb-4">
            Clique no botão abaixo para travar a localização da escola. O sistema usará essa coordenada para confirmar presenças dos alunos.
          </p>

          {!coords ? (
            <button
              type="button"
              onClick={capturarGPS}
              disabled={capturando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {capturando ? (
                <><Loader2 size={16} className="animate-spin" /> Capturando GPS...</>
              ) : (
                <><MapPin size={16} /> Usar localização atual</>
              )}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                <CheckCircle size={16} className="text-green-600" />
                <div className="text-xs text-green-700">
                  <p className="font-semibold">Localização capturada!</p>
                  <p>Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={capturarGPS}
                className="text-xs text-blue-600 hover:underline text-center"
              >
                Recapturar localização
              </button>
            </div>
          )}
        </div>

        {/* Mapa */}
        {coords && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 h-52">
            <MapaEscola lat={coords.lat} lng={coords.lng} raio={form.raio} />
          </div>
        )}

        {/* Raio */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Raio de presença
            </label>
            <span className="text-sm font-bold text-blue-600">{form.raio}m</span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={25}
            value={form.raio}
            onChange={(e) => setForm({ ...form, raio: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>50m</span>
            <span>500m</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={salvo || !coords}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition"
        >
          {salvo ? "✅ Escola salva com sucesso!" : "Salvar configurações"}
        </button>
      </form>
    </div>
  );
}
