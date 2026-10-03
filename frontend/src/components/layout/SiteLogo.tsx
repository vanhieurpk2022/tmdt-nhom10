import { cn } from '@/lib/utils'

type SiteLogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
}

export function SiteLogo({
  className,
  markClassName,
  textClassName,
}: SiteLogoProps) {
  return (
    <a
      href="/"
      className={cn(
        'inline-flex items-center gap-3 text-foreground no-underline',
        className,
      )}
      aria-label="Oilia trang chủ"
    >
      <span
        className={cn(
          'block size-7 rounded bg-slate-950 shadow-sm',
          markClassName,
        )}
        aria-hidden="true"
      />
      <span className={cn('text-[18px] font-semibold', textClassName)}>
        Oilia
      </span>
    </a>
  )
}
