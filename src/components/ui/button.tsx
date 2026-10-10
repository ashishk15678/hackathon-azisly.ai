import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./spinner";

/**
 * Centralised Button — single source of truth for all button styles.
 *
 * variants : default | primary | secondary | outline | ghost | danger | destructive | link
 * sizes    : xs | sm | default | md | lg | icon
 *
 * Extra props beyond the HTML spec:
 *   loading   — shows spinner, disables the button
 *   fullWidth — makes the button w-full
 */

const base = [
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl",
  "transition-all duration-150 select-none whitespace-nowrap",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
].join(" ");

const variants = {
  // Primary / default
  default:     "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700",
  primary:     "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700",
  // Soft indigo
  secondary:   "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200",
  // Bordered
  outline:     "border border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 active:bg-indigo-100",
  // Text only
  ghost:       "text-gray-600 bg-transparent hover:bg-gray-100 active:bg-gray-200",
  link:        "text-indigo-600 bg-transparent hover:underline underline-offset-4 p-0 h-auto",
  // Destructive (both spellings)
  danger:      "bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700",
  destructive: "bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700",
} as const;

const sizes = {
  xs:      "text-xs  px-2    py-1    h-6  rounded-lg",
  sm:      "text-xs  px-3    py-1.5  h-8",
  default: "text-sm  px-4    py-2    h-9",
  md:      "text-sm  px-4    py-2    h-9",
  lg:      "text-sm  px-6    py-2.5  h-11",
  icon:    "size-9",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   keyof typeof variants;
  size?:      keyof typeof sizes;
  loading?:   boolean;
  fullWidth?: boolean;
}

export function Button({
  variant   = "default",
  size      = "default",
  loading   = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Skip size classes for "link" variant since it has no padding/height
  const sizeClass = variant === "link" ? "" : sizes[size];

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        sizeClass,
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// Re-export buttonVariants stub so any code that imported it from here still compiles
export const buttonVariants = (opts?: { variant?: string; size?: string; className?: string }) =>
  cn(
    base,
    variants[(opts?.variant as keyof typeof variants) ?? "default"],
    opts?.size !== "link" ? sizes[(opts?.size as keyof typeof sizes) ?? "default"] : "",
    opts?.className,
  );
