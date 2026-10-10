import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-7', className)}>
      <path d="M2 30 L30 2 L30 30 Z" fill="currentColor" />
      <path d="M2 2 L22 2 L2 22 Z" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className="text-cobalt" />
      <span className="text-2xl font-medium tracking-tight text-ink">orvia</span>
    </span>
  )
}
