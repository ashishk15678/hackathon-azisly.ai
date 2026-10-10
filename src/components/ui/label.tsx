import { cn } from "@/lib/cn";
import type { LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: string;
}

export function Label({
  required,
  hint,
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-gray-700 mb-1.5",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && (
        <span className="ml-2 text-xs font-normal text-gray-400">{hint}</span>
      )}
    </label>
  );
}

/** Wraps a label + input + error message in a single field group */
export function Field({
  label,
  required,
  hint,
  error,
  id,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0", className)}>
      <Label htmlFor={id} required={required} hint={hint}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
