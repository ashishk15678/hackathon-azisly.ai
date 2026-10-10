'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { SplitHeading } from './reveal'
import { LogoMark } from './logo'

const columns = [
  { title: 'Product', links: ['Agent Studio', 'Decisioning', 'Integrations', 'Security'] },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
  { title: 'Resources', links: ['Documentation', 'Customer stories', 'Contact'] },
]

export function CtaFooter() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const wordY = useTransform(scrollYProgress, [0.3, 1], ['40%', '0%'])

  return (
    <>
      <section id="demo" className="px-3 md:px-5">
        <div className="relative overflow-hidden rounded-[2rem] bg-cobalt px-6 py-24 text-white md:px-14 md:py-36">
          <div className="dot-grid pointer-events-none absolute inset-0 text-white/15" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl text-center">
            <SplitHeading
              text="Multiply your marketing team"
              className="text-balance text-5xl font-medium leading-[0.98] tracking-[-0.045em] md:text-8xl"
            />
            <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-white/80">
              See how Orvia agents and decisioning can run on your stack in weeks, not quarters.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#"
                className="rounded-2xl bg-white px-6 py-4 text-base font-medium text-cobalt transition-transform hover:-translate-y-0.5"
              >
                Request a Demo
              </a>
              <a href="#" className="rounded-2xl border border-white/40 px-6 py-4 text-base font-medium transition-colors hover:bg-white/10">
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer ref={ref} className="overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <LogoMark className="size-9 text-cobalt" />
              <p className="mt-6 max-w-xs text-base leading-relaxed text-ink-soft">
                The agentic marketing platform for enterprise growth teams.
              </p>
            </div>
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h3 className="font-mono text-xs uppercase tracking-widest text-ink-soft">{c.title}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-base transition-colors hover:text-cobalt">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-16 flex flex-col justify-between gap-4 border-t border-border pt-6 text-sm text-ink-soft md:flex-row">
            <p>{`© ${new Date().getFullYear()} Orvia, Inc. All rights reserved.`}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-ink">Privacy</a>
              <a href="#" className="hover:text-ink">Terms</a>
            </div>
          </div>
        </div>
        <motion.p
          style={{ y: wordY }}
          aria-hidden="true"
          className="select-none text-center text-[34vw] font-medium leading-[0.78] tracking-[-0.07em] text-ink"
        >
          orvia
        </motion.p>
      </footer>
    </>
  )
}
