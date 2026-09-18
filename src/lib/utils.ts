import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcDistanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calcRisco(
  faltas: number,
  pendentes: number,
  media: number,
  tempoLivreMin: number
): "normal" | "atencao" | "risco" {
  let fatores = 0;
  if (faltas > 5) fatores++;
  if (pendentes > 3) fatores++;
  if (media < 6) fatores++;
  if (tempoLivreMin < 60) fatores++;
  if (fatores >= 3) return "risco";
  if (fatores >= 1) return "atencao";
  return "normal";
}

export function getRiscoConfig(nivel: string) {
  if (nivel === "risco") return { label: "Risco", color: "#dc2626", bg: "#fee2e2", emoji: "🔴" };
  if (nivel === "atencao") return { label: "Atenção", color: "#d97706", bg: "#fef3c7", emoji: "🟡" };
  return { label: "Normal", color: "#16a34a", bg: "#dcfce7", emoji: "🟢" };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
