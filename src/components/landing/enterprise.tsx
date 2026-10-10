'use client'

import { Globe2, Lock, ShieldCheck } from 'lucide-react'
import { Reveal, SplitHeading } from './reveal'

const pillars = [
  {
    Icon: ShieldCheck,
    title: 'Governed by design',
    body: 'Brand guardrails, approval flows, and full audit trails on every agent action.',
  },
  {
    Icon: Lock,
    title: 'Secure and compliant',
    body: 'SOC 2 Type II, GDPR, and CCPA ready. Your data is never used to train shared models.',
  },
  {
    Icon: Globe2,
    title: 'Global performance',
    body: 'Multi-region infrastructure with 99.99% uptime and sub-50ms decisions worldwide.',
  },
]

export function Enterprise() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
      <SplitHeading
        text="Enterprise-grade, from day one"
        className="max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.04em] md:text-7xl"
        wordClassName={(_, i) => (i >= 2 ? 'text-ink-soft' : undefined)}
      />
      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {pillars.map(({ Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.1} className="border-l-2 border-cobalt pl-6">
            <Icon className="size-6 text-cobalt" aria-hidden="true" />
            <h3 className="mt-6 text-2xl font-medium tracking-tight">{title}</h3>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">{body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
