import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-gray-100 text-gray-700",
  indigo: "bg-indigo-100 text-indigo-700",
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  dot?: boolean;
}

export function Badge({
  variant = "default",
  dot,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "green" && "bg-green-500",
            variant === "red" && "bg-red-500",
            variant === "yellow" && "bg-yellow-500",
            variant === "indigo" && "bg-indigo-500",
            variant === "blue" && "bg-blue-500",
            variant === "default" && "bg-gray-500",
          )}
        />
      )}
      {children}
    </span>
  );
}
