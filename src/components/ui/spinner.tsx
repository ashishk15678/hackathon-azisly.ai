import { cn } from "@/lib/cn";

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" } as const;

export function Spinner({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <svg
      className={cn("animate-spin text-indigo-600", sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
