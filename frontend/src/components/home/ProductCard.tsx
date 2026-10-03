import { Button } from '@/components/ui/button'
import {
  PlusIcon,
  ShoppingBagIcon,
  StarIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'

import type { HomeProduct } from './home-data'

type ProductCardProps = {
  product: HomeProduct
  variant?: 'compact' | 'sale'
}

const currencyFormatter = new Intl.NumberFormat('vi-VN')

export function ProductCard({ product, variant = 'compact' }: ProductCardProps) {
  const isSale = variant === 'sale'

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-emerald-950/10 bg-white shadow-[0_10px_30px_rgba(31,41,55,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(31,41,55,0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.tag && (
          <span
            className={cn(
              'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white',
              isSale ? 'bg-amber-500' : 'bg-emerald-700',
            )}
          >
            {product.tag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.rating && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
            <StarIcon className="size-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            {product.sold && (
              <span className="text-stone-400">- Đã bán {product.sold}</span>
            )}
          </div>
        )}

        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-stone-950">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-5 text-stone-500">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-end gap-2">
            <p className="text-sm font-bold text-stone-950">
              {currencyFormatter.format(product.price)}đ
            </p>
            {product.oldPrice && (
              <p className="text-xs font-medium text-stone-400 line-through">
                {currencyFormatter.format(product.oldPrice)}đ
              </p>
            )}
          </div>

          {isSale ? (
            <Button className="h-9 w-full gap-2 rounded-md bg-red-500 text-xs font-semibold text-white hover:bg-red-600">
              <ShoppingBagIcon className="size-4" />
              Mua ngay
            </Button>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-emerald-700">
                Còn hàng
              </span>
              <Button
                size="icon"
                className="size-8 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                aria-label={`Thêm ${product.name} vào giỏ hàng`}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
