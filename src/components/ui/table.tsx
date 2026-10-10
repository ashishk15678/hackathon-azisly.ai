import { cn } from "@/lib/cn";
import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className={cn("w-full text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Thead({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("bg-gray-50 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function Tbody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-gray-100", className)} {...props}>
      {children}
    </tbody>
  );
}

export function Tr({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("hover:bg-gray-50/60 transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Th({
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  className,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-gray-700", className)} {...props}>
      {children}
    </td>
  );
}
