'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const stories = [
  {
    brand: 'NORTHWIND',
    stat: '+24%',
    label: 'repeat purchase rate',
    quote: 'Our team went from four journeys a quarter to thousands of individual ones — without adding headcount.',
    theme: 'bg-paper',
  },
  {
    brand: 'halcyon',
    stat: '9×',
    label: 'faster campaign launch',
    quote: 'Briefs, builds, and approvals that took weeks now happen before lunch.',
    theme: 'bg-cobalt text-white',
  },
  {
    brand: 'ATLAS AIR',
    stat: '$41M',
    label: 'incremental annual revenue',
    quote: 'Decisioning found audiences we never would have segmented by hand.',
    theme: 'bg-ink text-white',
  },
  {
    brand: 'meridian',
    stat: '-37%',
    label: 'unsubscribe rate',
    quote: 'Fewer, better messages. Customers actually tell us they like our emails now.',
    theme: 'bg-[#e3e2d8]',
  },
]

export function CustomerStories() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '-62%'])

  return (
    <section ref={ref} aria-label="Customer stories" className="relative md:h-[260vh]">
      <div className="flex flex-col justify-center overflow-hidden py-24 md:sticky md:top-0 md:h-screen md:py-0">
        <div className="mx-auto mb-12 flex w-full max-w-[1440px] items-end justify-between gap-6 px-5 md:px-10">
          <h2 className="max-w-2xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.04em] md:text-6xl">
            Results that compound
          </h2>
          <a href="#" className="hidden items-center gap-1 text-base underline-offset-4 hover:underline md:inline-flex">
            All customer stories <ArrowUpRight className="size-4" />
          </a>
        </div>
        <motion.ul
          style={{ x }}
          className="flex w-max snap-x gap-5 overflow-x-visible px-5 max-md:!transform-none max-md:w-full max-md:snap-mandatory max-md:overflow-x-auto md:px-10"
        >
          {stories.map((s) => (
            <li
              key={s.brand}
              className={cn(
                'flex h-[440px] w-[82vw] shrink-0 snap-start flex-col justify-between rounded-[2rem] p-8 sm:w-[460px] md:h-[520px] md:w-[560px] md:p-10',
                s.theme,
              )}
            >
              <p className="text-xl font-semibold tracking-wider">{s.brand}</p>
              <div>
                <p className="text-7xl font-medium tracking-[-0.05em] md:text-9xl">{s.stat}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest opacity-70">{s.label}</p>
                <blockquote className="mt-8 max-w-sm text-lg leading-relaxed opacity-85">{`“${s.quote}”`}</blockquote>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
