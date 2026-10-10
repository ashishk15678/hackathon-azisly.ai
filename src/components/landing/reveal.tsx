'use client'

import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

export function Reveal({
  delay = 0,
  y = 32,
  className,
  children,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Splits a heading into words that rise from behind a mask, one after another. */
export function SplitHeading({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
  wordClassName,
}: {
  text: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  delay?: number
  wordClassName?: (word: string, index: number) => string | undefined
}) {
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className={cn('inline-block', wordClassName?.(word, i))}
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={{ duration: 1, ease, delay: delay + i * 0.07 }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
