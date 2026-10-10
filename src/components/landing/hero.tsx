'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { ArrowUp, Check, Loader2, User, Zap } from 'lucide-react'
import { SplitHeading } from './reveal'
import { cn } from '@/lib/utils'

const tasks = [
  'Analyze existing campaigns',
  'Build campaign brief',
  'Define goals, guardrails',
  'Pull content from CMS',
  'Route for approval',
  'Send via Orvia decisioning',
]

const audiences = [
  'Adventure seeker · 2+ friends referred · sorted by lowest price',
  'Luxury traveler · 3+ bookings in 12m · logged into loyalty',
  'Family planner · app installed · reviewed past stay',
]

const variants = [
  { src: '/images/variant-alps.png', title: 'Discover the Swiss Alps', body: 'Breathtaking peaks, cozy chalets, and world-class hiking await.' },
  { src: '/images/variant-coast.png', title: 'Your coastal escape', body: 'Quiet coves, sunlit villas, and slow mornings by the sea.' },
  { src: '/images/variant-canyon.png', title: 'Into the canyon', body: 'Guided desert treks and starlit camps, booked for your crew.' },
]

const ease = [0.22, 1, 0.36, 1] as const

function Pill({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease, delay }}
      className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-[#e3e2d8] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink"
    >
      <Zap className="size-3 fill-cobalt text-cobalt" aria-hidden="true" />
      {label}
    </motion.span>
  )
}

function useWorkflowCycle() {
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= tasks.length + 3) {
          setCycle((c) => c + 1)
          return 0
        }
        return s + 1
      })
    }, 850)
    return () => clearInterval(id)
  }, [])
  return { step, cycle }
}

function WorkflowDiagram() {
  const { step, cycle } = useWorkflowCycle()
  const activeAudience = Math.min(Math.max(step - 3, 0), audiences.length - 1)
  const variant = variants[cycle % variants.length]

  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      {/* connector line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, ease, delay: 0.3 }}
        className="absolute left-0 right-0 top-[15px] h-px origin-left bg-cobalt"
      />
      <div className="grid grid-cols-12 gap-6">
        {/* prompt */}
        <div className="col-span-3">
          <Pill label="Ask agent" delay={0.3} />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.5 }}
            className="mt-6 rounded-2xl bg-paper p-5 shadow-[0_30px_60px_-20px_rgba(34,34,34,0.25)]"
          >
            <p className="text-[17px] leading-snug text-ink">
              Diagnose the leaks in our repeat purchase funnel and initiate new campaigns to close them
            </p>
            <div className="mt-6 flex justify-end">
              <span className="grid size-8 place-items-center rounded-lg bg-cobalt text-white">
                <ArrowUp className="size-4" />
              </span>
            </div>
          </motion.div>
        </div>

        {/* workflow */}
        <div className="col-span-3 col-start-5">
          <Pill label="Agent workflow" delay={0.6} />
          <ul className="mt-6 flex flex-col items-start gap-2.5">
            {tasks.map((t, i) => {
              const done = step > i
              const running = step === i
              return (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.8 + i * 0.08 }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors duration-500',
                    done ? 'border-[#d6d5ca] text-ink' : 'border-[#e3e2d8] text-ink/35',
                  )}
                >
                  {done ? (
                    <Check className="size-3 text-cobalt" strokeWidth={3} />
                  ) : running ? (
                    <Loader2 className="size-3 animate-spin text-cobalt" />
                  ) : (
                    <span className="size-3 rounded-full border border-current" />
                  )}
                  {t}
                </motion.li>
              )
            })}
          </ul>
        </div>

        {/* decisioning */}
        <div className="col-span-3">
          <Pill label="AI decisioning" delay={0.9} />
          <ul className="mt-6 flex flex-col gap-6">
            {audiences.map((a, i) => {
              const active = step >= 4 && i === activeAudience
              return (
                <li
                  key={a}
                  className={cn(
                    'flex gap-3 font-mono text-[11px] uppercase leading-relaxed tracking-wider transition-colors duration-500',
                    active ? 'text-ink' : 'text-ink/35',
                  )}
                >
                  <User className={cn('mt-0.5 size-3 shrink-0', active ? 'fill-cobalt text-cobalt' : 'fill-current')} />
                  {a}
                </li>
              )
            })}
          </ul>
        </div>

        {/* variant */}
        <div className="col-span-3">
          <Pill label="Personalized variant" delay={1.2} />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 1.3 }}
            className="relative mt-6 aspect-[4/5] overflow-hidden rounded-2xl bg-ink shadow-[0_40px_80px_-30px_rgba(34,34,34,0.5)]"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={variant.src}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease }}
                className="absolute inset-0"
              >
                <Image src={variant.src || '/placeholder.svg'} alt="" fill sizes="25vw" className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xl font-medium tracking-tight">{variant.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/80">{variant.body}</p>
                  <span className="mt-4 inline-block rounded-md bg-white/15 px-3 py-1.5 text-xs backdrop-blur">Book now</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const diagramY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const diagramOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 md:px-10 lg:pt-20">
        <motion.div style={{ y: diagramY, opacity: diagramOpacity }}>
          <WorkflowDiagram />
        </motion.div>

        <motion.div style={{ y: textY }} className="mt-4 lg:mt-16">
          <SplitHeading
            as="h1"
            text="The marketer, multiplied"
            delay={0.2}
            className="max-w-3xl text-balance text-6xl font-medium leading-[0.95] tracking-[-0.045em] text-ink md:text-8xl lg:text-[8.5rem]"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.7 }}
            className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-ink md:text-xl"
          >
            Orvia is the agentic marketing platform that runs the work across your stack and delivers 1:1, personalized
            experiences to each customer.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.85 }}
            className="mt-10 flex flex-wrap items-center gap-8"
          >
            <a
              href="#demo"
              className="rounded-2xl bg-cobalt px-6 py-4 text-base font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Request a Demo
            </a>
            <a href="#how" className="text-base text-ink underline-offset-4 hover:underline">
              See how it works
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
