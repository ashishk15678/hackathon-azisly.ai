import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-50";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        inputBase,
        error ? "border-red-400" : "border-gray-300",
        className,
      )}
      {...props}
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        inputBase,
        "resize-none min-h-[80px]",
        error ? "border-red-400" : "border-gray-300",
        className,
      )}
      {...props}
    />
  );
}

/** Convenience select wrapper matching Input styles */
export function Select({
  error,
  className,
  children,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={cn(
        inputBase,
        "appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzZiNzI4MCIgZD0iTTcgMTBsNSA1IDUtNUg3eiIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem]",
        error ? "border-red-400" : "border-gray-300",
        className,
      )}
      {...(props as TextareaHTMLAttributes<HTMLSelectElement>)}
    >
      {children}
    </select>
  );
}
