'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { BarChart3, Boxes, Database, FileText, Mail, MessageCircle, ShoppingBag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SplitHeading } from './reveal'

const layers = [
  {
    key: 'apps',
    title: 'Your marketing apps',
    body: 'Orvia operates the tools you already own — ESPs, CMS, analytics, and ad platforms — without rip-and-replace.',
  },
  {
    key: 'agents',
    title: 'Orvia agents',
    body: 'Autonomous agents plan, build, and launch campaigns end-to-end, with your goals and guardrails built in.',
  },
  {
    key: 'decisioning',
    title: 'Orvia decisioning',
    body: 'A real-time engine picks the right message, channel, and moment for every individual customer.',
  },
]

const appTiles = [
  { Icon: Mail, color: '#ee6c43' },
  { Icon: Database, color: '#2350f5' },
  { Icon: BarChart3, color: '#222222' },
  { Icon: MessageCircle, color: '#7ee07a' },
  { Icon: FileText, color: '#9b8cf5' },
  { Icon: ShoppingBag, color: '#f5c542' },
  { Icon: Users, color: '#2350f5' },
  { Icon: Boxes, color: '#ee6c43' },
  { Icon: Mail, color: '#222222' },
]

function Plane({
  index,
  active,
  offset,
  children,
}: {
  index: number
  active: boolean
  offset: MotionValue<number>
  children?: React.ReactNode
}) {
  return (
    <motion.div style={{ y: offset, zIndex: 10 - index }} className="absolute inset-0 grid place-items-center">
      <div
        className={cn(
          'relative size-[230px] rounded-3xl border transition-[background-color,border-color,box-shadow] duration-500 sm:size-[300px]',
          active
            ? 'border-cobalt bg-paper shadow-[0_40px_80px_-30px_rgba(35,80,245,0.45)]'
            : 'border-[#d6d5ca] bg-paper/70',
        )}
        style={{ transform: 'rotateX(58deg) rotateZ(-45deg)', transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </motion.div>
  )
}

export function Stack() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(2, Math.floor(v * 3))))

  const spread = useTransform(scrollYProgress, [0, 0.35], [0, 1])
  const top = useTransform(spread, [0, 1], [-20, -120])
  const mid = useTransform(spread, [0, 1], [0, 0])
  const bottom = useTransform(spread, [0, 1], [20, 120])

  return (
    <section className="px-3 py-3 md:px-5">
      <div ref={ref} className="relative rounded-[2rem] bg-paper lg:h-[260vh]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-5 py-20 md:px-10 lg:sticky lg:top-0 lg:h-screen lg:flex-row lg:items-center lg:py-0">
          <div className="lg:w-1/2">
            <SplitHeading
              text="An agentic platform that works with your stack"
              className="max-w-xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.04em] md:text-6xl"
            />
            <ol className="mt-12 flex max-w-md flex-col">
              {layers.map((l, i) => (
                <li
                  key={l.key}
                  className={cn(
                    'border-l-2 py-4 pl-6 transition-colors duration-500',
                    active === i ? 'border-cobalt' : 'border-border',
                  )}
                >
                  <p
                    className={cn(
                      'font-mono text-xs uppercase tracking-widest transition-colors duration-500',
                      active === i ? 'text-cobalt' : 'text-ink-soft',
                    )}
                  >
                    {`0${i + 1}`} — {l.title}
                  </p>
                  <motion.p
                    initial={false}
                    animate={{ height: active === i ? 'auto' : 0, opacity: active === i ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden text-base leading-relaxed text-ink"
                  >
                    <span className="block pt-2">{l.body}</span>
                  </motion.p>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative h-[460px] [perspective:1400px] lg:h-[620px] lg:w-1/2" aria-hidden="true">
            <Plane index={0} active={active === 0} offset={top}>
              <div className="grid size-full grid-cols-3 gap-4 p-6">
                {appTiles.map(({ Icon, color }, i) => (
                  <div key={i} className="grid place-items-center rounded-xl" style={{ backgroundColor: color }}>
                    <Icon className="size-6 text-white" />
                  </div>
                ))}
              </div>
            </Plane>
            <Plane index={1} active={active === 1} offset={mid}>
              <div className="flex size-full items-center justify-center p-8">
                <div className="grid size-full grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border-2 border-dashed border-cobalt/40 bg-cobalt/5" />
                  ))}
                </div>
              </div>
            </Plane>
            <Plane index={2} active={active === 2} offset={bottom}>
              <div className="dot-grid size-full rounded-3xl text-cobalt/40" />
            </Plane>
          </div>
        </div>
      </div>
    </section>
  )
}
