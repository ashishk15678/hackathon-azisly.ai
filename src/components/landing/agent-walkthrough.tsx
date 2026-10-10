'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Check, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SplitHeading } from './reveal'

const ease = [0.22, 1, 0.36, 1] as const

const steps = [
  {
    title: 'Spot weak campaigns',
    body: 'Ask the agent where you are losing customers. It reads every campaign and funnel stage and pinpoints the leaks.',
    prompt: 'Where is our repeat purchase funnel leaking?',
  },
  {
    title: 'Build the fix',
    body: 'The agent drafts briefs, pulls approved content, and assembles campaigns in your existing tools — ready for review.',
    prompt: 'Draft campaigns to win back first-time buyers.',
  },
  {
    title: 'Personalize every decision',
    body: 'Decisioning picks the best message and moment for each customer, then learns from every response.',
    prompt: 'Launch with 1:1 decisioning across email and app.',
  },
]

const funnel = [
  { label: 'First purchase', value: 100 },
  { label: 'Returned in 30d', value: 64 },
  { label: 'Browsed again', value: 41 },
  { label: 'Second purchase', value: 12, leak: true },
]

const buildTasks = ['Campaign brief', 'Audience: first-time buyers', 'Content pulled from CMS', 'Sent for approval']

const customers = [
  { name: 'Maya R.', msg: 'Your size is back in stock', status: 'Converted' },
  { name: 'Jonas K.', msg: '15% off your next order', status: 'Converted' },
  { name: 'Priya S.', msg: 'Picked for you: trail kits', status: 'Pending' },
]

function StepVisual({ step }: { step: number }) {
  if (step === 0) {
    return (
      <ul className="flex flex-col gap-4">
        {funnel.map((f, i) => (
          <li key={f.label}>
            <div className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              <span>{f.label}</span>
              <span className={cn(f.leak && 'text-ember')}>{f.value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#e6e5da]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${f.value}%` }}
                transition={{ duration: 1, ease, delay: 0.2 + i * 0.12 }}
                className={cn('h-full rounded-full', f.leak ? 'bg-ember' : 'bg-cobalt')}
              />
            </div>
          </li>
        ))}
        <motion.li
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-2 rounded-xl bg-ember/10 p-3 text-sm text-ink"
        >
          Leak found: 71% of browsers never make a second purchase.
        </motion.li>
      </ul>
    )
  }
  if (step === 1) {
    return (
      <ul className="flex flex-col gap-3">
        {buildTasks.map((t, i) => (
          <motion.li
            key={t}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.18 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-cream/60 px-4 py-3 text-sm"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.18, type: 'spring', stiffness: 400, damping: 18 }}
              className="grid size-5 place-items-center rounded-full bg-cobalt text-white"
            >
              <Check className="size-3" strokeWidth={3} />
            </motion.span>
            {t}
          </motion.li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {customers.map((c, i) => (
        <motion.li
          key={c.name}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.15 }}
          className="flex items-center gap-3 rounded-xl border border-border bg-cream/60 p-3"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white">
            <User className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="truncate text-xs text-ink-soft">{c.msg}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider',
              c.status === 'Converted' ? 'bg-signal/40 text-ink' : 'bg-[#e6e5da] text-ink-soft',
            )}
          >
            {c.status}
          </span>
        </motion.li>
      ))}
    </ul>
  )
}

export function AgentWalkthrough() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] })
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)))))

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
      <p className="font-mono text-xs uppercase tracking-widest text-cobalt">Orvia agents</p>
      <SplitHeading
        text="Become a 10x marketer"
        className="mt-4 text-balance text-5xl font-medium leading-[0.98] tracking-[-0.045em] md:text-8xl"
        wordClassName={(w) => (w === '10x' ? 'text-cobalt' : undefined)}
      />
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
        Hand the repetitive work to agents that understand your goals, your customers, and your brand.
      </p>

      <div ref={ref} className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <ol className="relative flex flex-col">
          <div className="absolute bottom-0 left-[15px] top-0 w-px bg-border" aria-hidden="true">
            <motion.div style={{ scaleY: scrollYProgress }} className="h-full w-full origin-top bg-cobalt" />
          </div>
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-6 pb-16 last:pb-0 lg:min-h-[60vh]">
              <span
                className={cn(
                  'relative z-10 grid size-8 shrink-0 place-items-center rounded-full font-mono text-xs transition-colors duration-500',
                  i <= active ? 'bg-cobalt text-white' : 'bg-[#e6e5da] text-ink-soft',
                )}
              >
                {i + 1}
              </span>
              <div className={cn('transition-opacity duration-500', i === active ? 'opacity-100' : 'lg:opacity-40')}>
                <h3 className="text-3xl font-medium tracking-tight md:text-4xl">{s.title}</h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">{s.body}</p>
                <div className="mt-8 rounded-2xl bg-paper p-5 shadow-sm lg:hidden">
                  <StepVisual step={i} />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="hidden lg:block">
          <div className="sticky top-32 rounded-3xl bg-paper p-6 shadow-[0_40px_80px_-40px_rgba(34,34,34,0.35)]">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Sparkles className="size-4 text-cobalt" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">Orvia agent</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease }}
                className="pt-5"
              >
                <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-cobalt px-4 py-3 text-sm text-white">
                  {steps[active].prompt}
                </p>
                <div className="mt-6 min-h-[300px]">
                  <StepVisual step={active} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
