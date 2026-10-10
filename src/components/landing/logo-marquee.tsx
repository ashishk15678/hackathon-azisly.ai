const brands = [
  { name: 'NORTHWIND', className: 'font-semibold tracking-[0.2em]' },
  { name: 'halcyon', className: 'font-light italic text-3xl' },
  { name: 'Vertex&Co', className: 'font-bold tracking-tight' },
  { name: 'KŌBO', className: 'font-mono font-medium tracking-[0.3em]' },
  { name: 'meridian', className: 'font-medium lowercase tracking-tight' },
  { name: 'ATLAS AIR', className: 'font-black italic tracking-tight' },
  { name: 'Fernway', className: 'font-serif text-3xl' },
  { name: 'PULSE/', className: 'font-mono font-bold' },
]

export function LogoMarquee() {
  return (
    <section aria-label="Trusted by" className="border-y border-border py-10">
      <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-ink-soft">
        Trusted by growth teams at enterprise brands
      </p>
      <div className="mask-fade-x overflow-hidden">
        <ul className="flex w-max animate-marquee items-center gap-20 pr-20 hover:[animation-play-state:paused]">
          {[...brands, ...brands].map((b, i) => (
            <li
              key={`${b.name}-${i}`}
              aria-hidden={i >= brands.length}
              className={`whitespace-nowrap text-2xl text-ink/70 transition-colors hover:text-ink ${b.className}`}
            >
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
