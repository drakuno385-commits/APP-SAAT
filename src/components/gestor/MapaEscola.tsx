"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapaEscolaProps {
  lat: number;
  lng: number;
  raio: number;
}

export default function MapaEscola({ lat, lng, raio }: MapaEscolaProps) {
  useEffect(() => {
    // Fix Leaflet icon in Next.js
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={17}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>Localização da escola</Popup>
      </Marker>
      <Circle
        center={[lat, lng]}
        radius={raio}
        pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.15 }}
      />
    </MapContainer>
  );
}