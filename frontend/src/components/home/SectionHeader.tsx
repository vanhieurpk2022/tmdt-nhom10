import { ArrowRightIcon } from '@/components/ui/icons'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  actionLabel?: string
}

export function SectionHeader({
  eyebrow,
  title,
  actionLabel = 'Xem tất cả sản phẩm',
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase text-emerald-700">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal text-stone-950">
          {title}
        </h2>
      </div>
      <a
        href="#xem-tat-ca"
        className="hidden items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-red-500 sm:flex"
      >
        {actionLabel}
        <ArrowRightIcon className="size-4" />
      </a>
    </div>
  )
}
