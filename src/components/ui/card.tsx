import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

/**
 * Card  —  white surface with subtle shadow and border.
 * Use CardHeader / CardBody / CardFooter for consistent internal spacing.
 */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Makes border glow indigo — useful for selected/active state */
  highlighted?: boolean;
  /** Removes padding — useful when embedding full-bleed content */
  noPadding?: boolean;
}

export function Card({
  highlighted,
  noPadding,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border shadow-sm",
        highlighted
          ? "border-indigo-500 ring-2 ring-indigo-500/20"
          : "border-gray-200",
        !noPadding && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-5 pt-4 border-t border-gray-100 flex items-center gap-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
