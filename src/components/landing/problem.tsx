'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Bell, Check, Mail, MessageSquare, Smartphone, X } from 'lucide-react'
import { Reveal } from './reveal'

const ease = [0.22, 1, 0.36, 1] as const

function ScrollLine({ text, progress, range }: { text: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span style={{ opacity }} className="block">
      {text}
    </motion.span>
  )
}

function ScrollWord({ word, progress, range, accentClassName }: {
  word: string
  progress: MotionValue<number>
  range: [number, number]
  accentClassName?: string
}) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const y = useTransform(progress, range, [28, 0])
  const rotateX = useTransform(progress, range, [-55, 0])
  const filter = useTransform(progress, range, ['blur(8px)', 'blur(0px)'])
  const underline = useTransform(progress, [range[1], Math.min(range[1] + 0.25, 1)], [0, 1])

  return (
    <motion.span
      style={{ opacity, y, rotateX, filter }}
      className={`relative inline-block origin-bottom ${accentClassName ?? ''}`}
    >
      {word}
      {accentClassName && (
        <motion.span
          style={{ scaleX: underline }}
          className="absolute inset-x-0 -bottom-1 h-[3px] origin-left rounded-full bg-current"
        />
      )}
    </motion.span>
  )
}

function ScrollHeading({ text, accentWord, accentClassName }: {
  text: string
  accentWord: string
  accentClassName: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'start 40%'] })
  const words = text.split(' ')
  const step = 0.75 / words.length

  return (
    <h3
      ref={ref}
      className="mt-3 text-3xl font-medium tracking-tight [perspective:600px] md:text-4xl"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="flex flex-wrap gap-x-[0.25em]">
        {words.map((word, i) =>
          reduceMotion ? (
            <span key={`${word}-${i}`} className={word === accentWord ? accentClassName : undefined}>
              {word}
            </span>
          ) : (
            <ScrollWord
              key={`${word}-${i}`}
              word={word}
              progress={scrollYProgress}
              range={[i * step, i * step + step * 1.6]}
              accentClassName={word === accentWord ? accentClassName : undefined}
            />
          ),
        )}
      </span>
    </h3>
  )
}

const messyPaths = [
  'M40 60 L180 60 L240 150 L380 150 L430 70 L560 70 L640 210 L760 210',
  'M40 160 L120 160 L200 250 L330 250 L380 120 L520 120 L560 260 L700 260',
  'M40 260 L160 260 L230 90 L360 90 L420 230 L580 230 L620 140 L740 140',
]
const failMarks = [
  [760, 210],
  [700, 260],
  [740, 140],
]

const cleanRows = [
  { y: 70, icons: [Mail, Smartphone, Bell] },
  { y: 160, icons: [MessageSquare, Mail, Bell] },
  { y: 250, icons: [Smartphone, MessageSquare, Mail] },
]

const inView = { once: true, margin: '-20% 0px' } as const

const MESSY_PULSE = { duration: 2.6, repeatDelay: 1.4 }
const CLEAN_PULSE = { duration: 2.8, repeatDelay: 0.6 }
const CLEAN_PERIOD = CLEAN_PULSE.duration + CLEAN_PULSE.repeatDelay

function GridCard({ className, dotClassName, glowClassName, children }: {
  className: string
  dotClassName: string
  glowClassName: string
  children: ReactNode
}) {
  const mx = useMotionValue(-400)
  const my = useMotionValue(-400)
  const mask = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, black, transparent)`

  return (
    <motion.div
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - rect.left)
        my.set(e.clientY - rect.top)
      }}
      onPointerLeave={() => {
        mx.set(-400)
        my.set(-400)
      }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={`group relative h-full overflow-hidden rounded-3xl p-6 md:p-10 ${className}`}
    >
      <div className={`dot-grid grid-drift pointer-events-none absolute inset-0 ${dotClassName}`} />
      <motion.div
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className={`dot-grid grid-drift pointer-events-none absolute inset-0 [background-size:40px_40px] ${glowClassName}`}
      />
      <div className="relative">{children}</div>
    </motion.div>
  )
}

function MessyJourneys() {
  return (
    <svg viewBox="0 0 800 320" className="h-auto w-full overflow-visible" aria-hidden="true">
      {messyPaths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#8a8980"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={inView}
          transition={{ duration: 2, ease: 'easeInOut', delay: i * 0.25 }}
        />
      ))}
      {messyPaths.map((d, i) => (
        <motion.path
          key={`pulse-${d}`}
          d={d}
          fill="none"
          stroke="#f5a524"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0.07, pathOffset: 0, opacity: 0 }}
          whileInView={{ pathOffset: [0, 0.93], opacity: [0, 1, 1, 0] }}
          viewport={inView}
          transition={{
            ...MESSY_PULSE,
            ease: 'easeIn',
            times: [0, 0.1, 0.8, 1],
            repeat: Infinity,
            delay: 2.6 + i * 0.7,
          }}
        />
      ))}
      {failMarks.map(([x, y], i) => (
        <motion.g
          key={`${x}-${y}`}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={inView}
          transition={{ duration: 0.4, ease, delay: 2 + i * 0.25 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          <motion.circle
            cx={x}
            cy={y}
            fill="none"
            stroke="#e5484d"
            strokeWidth={2}
            initial={{ r: 14, opacity: 0 }}
            whileInView={{ r: [14, 34], opacity: [0.8, 0] }}
            viewport={inView}
            transition={{
              duration: 1,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: MESSY_PULSE.duration + MESSY_PULSE.repeatDelay - 1,
              delay: 2.6 + i * 0.7 + MESSY_PULSE.duration,
            }}
          />
          <motion.g
            whileInView={{ rotate: [0, -14, 12, -8, 0] }}
            viewport={inView}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: MESSY_PULSE.duration + MESSY_PULSE.repeatDelay - 0.5,
              delay: 2.6 + i * 0.7 + MESSY_PULSE.duration,
            }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            <circle cx={x} cy={y} r={14} fill="#e5484d" />
            <X x={x - 8} y={y - 8} width={16} height={16} color="#fff" strokeWidth={3} />
          </motion.g>
        </motion.g>
      ))}
    </svg>
  )
}

function CleanJourneys() {
  return (
    <svg viewBox="0 0 800 320" className="h-auto w-full overflow-visible" aria-hidden="true">
      {cleanRows.map((row, r) => {
        const pulseStart = 2.2 + r * 0.9
        const arrivalAt = (x: number) => pulseStart + ((x - 40) / 700) * CLEAN_PULSE.duration
        return (
          <g key={row.y}>
            <motion.path
              d={`M40 ${row.y} L740 ${row.y}`}
              stroke="#fff"
              strokeOpacity={0.9}
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={inView}
              transition={{ duration: 1.6, ease: 'easeInOut', delay: r * 0.15 }}
            />
            <motion.g
              initial={{ x: 0, opacity: 0 }}
              whileInView={{ x: [0, 700], opacity: [0, 1, 1, 0] }}
              viewport={inView}
              transition={{
                ...CLEAN_PULSE,
                ease: 'linear',
                times: [0, 0.05, 0.95, 1],
                repeat: Infinity,
                delay: pulseStart,
              }}
            >
              <circle cx={40} cy={row.y} r={12} fill="#fff" opacity={0.25} />
              <circle cx={40} cy={row.y} r={5} fill="#fff" />
            </motion.g>
            {row.icons.map((Icon, i) => {
              const x = 180 + i * 190
              return (
                <motion.g
                  key={x}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={inView}
                  transition={{ duration: 0.5, ease, delay: r * 0.15 + 0.3 + i * 0.3 }}
                  style={{ transformOrigin: `${x}px ${row.y}px` }}
                >
                  <motion.g
                    whileInView={{ scale: [1, 1.22, 1], y: [0, -4, 0] }}
                    viewport={inView}
                    transition={{
                      duration: 0.5,
                      ease: 'easeOut',
                      repeat: Infinity,
                      repeatDelay: CLEAN_PERIOD - 0.5,
                      delay: arrivalAt(x) - 0.2,
                    }}
                    style={{ transformOrigin: `${x}px ${row.y}px` }}
                  >
                    <rect x={x - 18} y={row.y - 18} width={36} height={36} rx={10} fill="#fff" />
                    <Icon x={x - 9} y={row.y - 9} width={18} height={18} color="#2350f5" strokeWidth={2} />
                  </motion.g>
                </motion.g>
              )
            })}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={inView}
              transition={{ duration: 0.45, ease, delay: 1.6 + r * 0.15 }}
              style={{ transformOrigin: `740px ${row.y}px` }}
            >
              <motion.circle
                cx={740}
                cy={row.y}
                fill="none"
                stroke="#7ee07a"
                strokeWidth={2}
                initial={{ r: 16, opacity: 0 }}
                whileInView={{ r: [16, 36], opacity: [0.9, 0] }}
                viewport={inView}
                transition={{
                  duration: 0.9,
                  ease: 'easeOut',
                  repeat: Infinity,
                  repeatDelay: CLEAN_PERIOD - 0.9,
                  delay: arrivalAt(740),
                }}
              />
              <circle cx={740} cy={row.y} r={16} fill="#7ee07a" />
              <Check x={731} y={row.y - 9} width={18} height={18} color="#222" strokeWidth={3} />
            </motion.g>
          </g>
        )
      })}
    </svg>
  )
}

export function Problem() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { scrollYProgress } = useScroll({ target: headingRef, offset: ['start 85%', 'end 45%'] })

  return (
    <section id="how" className="bg-ink text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
        <h2
          ref={headingRef}
          className="max-w-5xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.04em] md:text-7xl"
        >
          <ScrollLine text="Marketing hasn't kept up" progress={scrollYProgress} range={[0, 0.4]} />
          <ScrollLine text="with the needs of the" progress={scrollYProgress} range={[0.3, 0.7]} />
          <ScrollLine text="modern customer." progress={scrollYProgress} range={[0.6, 1]} />
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="hidden md:block" />
          <Reveal className="space-y-6 text-lg leading-relaxed text-white/75">
            <p>
              Customers live in the moment. They expect you to be there with the right product, the right content, and the
              right next step.
            </p>
            <p>
              Teams are stuck in manual work spanning disconnected tools — from strategy to campaign building and
              execution. And because they can only design a handful of rigid, rules-based journeys, customers still get
              irrelevant marketing.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-5 lg:grid-cols-2">
          <Reveal className="h-full">
            <GridCard className="bg-[#2c2c2b]" dotClassName="text-white/10" glowClassName="text-[#f5a524]/70">
              <p className="font-mono text-xs uppercase tracking-widest text-white/50">Today</p>
              <ScrollHeading text="Your journeys are a mess" accentWord="mess" accentClassName="text-[#f5a524]" />
              <div className="mt-10">
                <MessyJourneys />
              </div>
            </GridCard>
          </Reveal>
          <Reveal delay={0.15} className="h-full">
            <GridCard className="bg-cobalt" dotClassName="text-white/15" glowClassName="text-white/80">
              <p className="font-mono text-xs uppercase tracking-widest text-white/70">With Orvia</p>
              <ScrollHeading text="Clean them up with Orvia" accentWord="Orvia" accentClassName="text-[#7ee07a]" />
              <div className="mt-10">
                <CleanJourneys />
              </div>
            </GridCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
