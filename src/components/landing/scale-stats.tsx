'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue, useTransform, motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'

const events = [
  ['cart_abandoned', 'send_reminder · email'],
  ['viewed_pdp × 3', 'show_review_carousel'],
  ['loyalty_tier_up', 'unlock_perk · app'],
  ['search_no_result', 'suggest_alternatives'],
  ['subscription_paused', 'offer_flex_plan'],
  ['first_purchase', 'welcome_series · day 2'],
  ['browsed_category', 'curate_collection'],
  ['price_drop_watch', 'notify · push'],
]

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const value = useMotionValue(0)
  const rounded = useTransform(value, (v) => Math.round(v).toString())
  useEffect(() => {
    if (!inView) return
    const controls = animate(value, to, { duration: 2.2, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, to, value])
  return <motion.span ref={ref}>{rounded}</motion.span>
}

function EventColumn({ reverse = false }: { reverse?: boolean }) {
  const rows = [...events, ...events]
  return (
    <div className="mask-fade-y h-[420px] overflow-hidden">
      <ul
        className="flex animate-marquee-y flex-col gap-3"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {rows.map(([evt, decision], i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs">
            <span className="text-white/50">{evt}</span>
            <ArrowRight className="size-3 shrink-0 text-cobalt" aria-hidden="true" />
            <span className="truncate text-signal">{decision}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ScaleStats() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-16 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">Built for enterprise scale</p>
          <p className="mt-6 text-7xl font-medium tracking-[-0.05em] md:text-[9rem] md:leading-none">
            <Counter to={200} />
            <span className="text-cobalt"> billion</span>
          </p>
          <Reveal>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              decisions made every month — each one tailored to a single customer, in under 50 milliseconds.
            </p>
          </Reveal>
          <dl className="mt-12 grid max-w-md grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-white/50">Avg. revenue lift</dt>
              <dd className="mt-2 text-4xl font-medium tracking-tight">
                +<Counter to={18} />%
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-white/50">Hours saved / mo</dt>
              <dd className="mt-2 text-4xl font-medium tracking-tight">
                <Counter to={340} />
              </dd>
            </div>
          </dl>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-hidden="true">
          <EventColumn />
          <div className="hidden sm:block">
            <EventColumn reverse />
          </div>
        </div>
      </div>
    </section>
  )
}
