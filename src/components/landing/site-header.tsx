'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowRight, ChevronDown, X } from 'lucide-react'
import { Logo } from './logo'
import { cn } from '@/lib/utils'

const links = ['About', 'Documentation', 'Blog']

export function SiteHeader() {
  const [bannerOpen, setBannerOpen] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  return (
    <div className="sticky top-0 z-50">
      <AnimatePresence initial={false}>
        {bannerOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-cobalt text-white"
          >
            <div className="relative flex items-center justify-center px-12 py-2.5 text-sm font-medium">
              <a href="#studio" className="group inline-flex items-center gap-1.5 tracking-tight">
                Orvia launches Agent Studio
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <button
                type="button"
                onClick={() => setBannerOpen(false)}
                className="absolute right-4 rounded p-1 hover:bg-white/10"
                aria-label="Dismiss announcement"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          'transition-[background-color,box-shadow,backdrop-filter] duration-300',
          scrolled ? 'bg-cream/80 shadow-[0_1px_0_var(--border)] backdrop-blur-md' : 'bg-cream',
        )}
      >
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10" aria-label="Main">
          <a href="#" aria-label="Orvia home">
            <Logo />
          </a>
          <div className="flex items-center gap-2 md:gap-8">
            <ul className="hidden items-center gap-8 text-[15px] text-ink-soft lg:flex">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="transition-colors hover:text-ink">
                    {l}
                  </a>
                </li>
              ))}
              <li>
                <button type="button" className="inline-flex items-center gap-1 transition-colors hover:text-ink">
                  Products <ChevronDown className="size-4" />
                </button>
              </li>
            </ul>
            <a
              href="#demo"
              className="rounded-xl bg-cobalt px-4 py-2.5 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Request a demo
            </a>
          </div>
        </nav>
      </header>
    </div>
  )
}
