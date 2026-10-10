import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

const variants = {
  info: { wrap: "bg-indigo-50 border-indigo-200 text-indigo-800", icon: "ℹ️" },
  success: {
    wrap: "bg-green-50  border-green-200  text-green-800",
    icon: "✅",
  },
  warning: {
    wrap: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: "⚠️",
  },
  error: { wrap: "bg-red-50    border-red-200    text-red-800", icon: "❌" },
} as const;

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  title?: string;
}

export function Alert({
  variant = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const { wrap, icon } = variants[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        wrap,
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="text-base leading-5">
        {icon}
      </span>
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <p className="leading-relaxed">{children}</p>}
      </div>
    </div>
  );
}
