import { cn } from "@/lib/utils";

type BadgeVariant = "normal" | "atencao" | "risco" | "default" | "pendente" | "concluida";

const variants: Record<BadgeVariant, string> = {
  normal:   "bg-green-100 text-green-700 border-green-200",
  atencao:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  risco:    "bg-red-100 text-red-700 border-red-200",
  default:  "bg-slate-100 text-slate-700 border-slate-200",
  pendente: "bg-orange-100 text-orange-700 border-orange-200",
  concluida:"bg-green-100 text-green-700 border-green-200",
};

const icons: Record<BadgeVariant, string> = {
  normal:   "🟢",
  atencao:  "🟡",
  risco:    "🔴",
  default:  "",
  pendente: "⏳",
  concluida:"✅",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function Badge({ variant = "default", children, className, showIcon = true }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variants[variant],
        className
      )}
    >
      {showIcon && icons[variant] && <span>{icons[variant]}</span>}
      {children}
    </span>
  );
}
