import { cn } from "@/lib/cn";

export interface ProgressProps {
  value: number; // 0–100
  max?: number;
  size?: "sm" | "md";
  variant?: "indigo" | "green" | "yellow" | "red";
  className?: string;
  label?: string;
}

const trackH = { sm: "h-1.5", md: "h-2.5" } as const;
const fillColor = {
  indigo: "bg-indigo-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
} as const;

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "indigo",
  className,
  label,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn("w-full", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {label && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-100 rounded-full overflow-hidden",
          trackH[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            fillColor[variant],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Countdown ring — used in game view for time-remaining */
export function CountdownRing({
  value,
  max,
  size = 96,
  danger = false,
}: {
  value: number;
  max: number;
  size?: number;
  danger?: boolean;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const dash = circ * pct;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="6"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={danger ? "#ef4444" : "#6366f1"}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}
