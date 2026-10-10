/** Lightweight cx — merges class strings, filters falsy values. No extra deps needed. */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
