import { cn } from "@/lib/cn";

const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

/** Generates a consistent hue from a name string */
function nameToColor(name: string) {
  const colors = [
    "bg-indigo-500",
    "bg-violet-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + (hash << 5) - hash;
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        nameToColor(name),
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
