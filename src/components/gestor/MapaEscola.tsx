"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige o ícone padrão do Leaflet no lado do cliente
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapaEscolaProps {
  lat: number;
  lng: number;
  raio: number;
}

export default function MapaEscola({ lat, lng, raio }: MapaEscolaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const circle = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Inicializa o mapa apenas uma vez
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        scrollWheelZoom: false,
      }).setView([lat, lng], 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(leafletMap.current);

      marker.current = L.marker([lat, lng]).addTo(leafletMap.current);
      marker.current.bindPopup("Localização da escola").openPopup();

      circle.current = L.circle([lat, lng], {
        color: "#2563eb",
        fillColor: "#2563eb",
        fillOpacity: 0.15,
        radius: raio
      }).addTo(leafletMap.current);
    } else {
      // Se o mapa já existe, apenas atualiza as posições
      leafletMap.current.setView([lat, lng]);
      if (marker.current) {
        marker.current.setLatLng([lat, lng]);
      }
      if (circle.current) {
        circle.current.setLatLng([lat, lng]);
        circle.current.setRadius(raio);
      }
    }

    // Cleanup na desmontagem do componente
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [lat, lng, raio]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%", zIndex: 1 }} />;
}