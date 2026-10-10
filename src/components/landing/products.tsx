'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, Bot, GitBranch, Layers, Target, Timer, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'

const products = [
  {
    id: 'studio',
    eyebrow: 'Product 01',
    name: 'Agent Studio',
    body: 'Build, test, and deploy marketing agents that plan and execute campaigns across your stack — with approvals and guardrails at every step.',
    features: [
      { Icon: Bot, label: 'Prebuilt marketing agents' },
      { Icon: Workflow, label: 'Multi-step workflows' },
      { Icon: Layers, label: 'Native tool connectors' },
    ],
    theme: 'bg-ink text-white',
    accent: 'text-signal',
  },
  {
    id: 'decisioning',
    eyebrow: 'Product 02',
    name: 'Decisioning',
    body: 'A self-learning engine that chooses the next best message, offer, and channel for every customer — in real time, at enterprise scale.',
    features: [
      { Icon: Target, label: '1:1 offer selection' },
      { Icon: Timer, label: 'Send-time optimization' },
      { Icon: GitBranch, label: 'Always-on experimentation' },
    ],
    theme: 'bg-cobalt text-white',
    accent: 'text-white',
  },
]

function ProductCard({ product, index, total }: { product: (typeof products)[number]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, index === total - 1 ? 1 : 0.92])
  const dim = useTransform(scrollYProgress, [0, 1], [0, index === total - 1 ? 0 : 0.35])

  return (
    <div ref={ref} className="sticky top-24 h-[85vh] min-h-[560px]" style={{ paddingTop: index * 24 }}>
      <motion.article
        id={product.id}
        style={{ scale }}
        className={cn('relative flex h-full origin-top flex-col justify-between overflow-hidden rounded-[2rem] p-8 md:p-14', product.theme)}
      >
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" aria-hidden="true" />
        <div className="dot-grid pointer-events-none absolute inset-0 text-white/10" aria-hidden="true" />
        <div className="relative">
          <p className={cn('font-mono text-xs uppercase tracking-widest', product.accent)}>{product.eyebrow}</p>
          <h3 className="mt-4 text-5xl font-medium tracking-[-0.045em] md:text-8xl">{product.name}</h3>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{product.body}</p>
        </div>
        <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <ul className="grid gap-3 sm:grid-cols-3 md:max-w-3xl">
            {product.features.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm backdrop-blur">
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <a href="#demo" className="group inline-flex items-center gap-2 whitespace-nowrap text-base font-medium">
            Explore {product.name}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </motion.article>
    </div>
  )
}

export function Products() {
  return (
    <section aria-label="Products" className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <div className="flex flex-col gap-[10vh]">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} total={products.length} />
        ))}
      </div>
    </section>
  )
}
