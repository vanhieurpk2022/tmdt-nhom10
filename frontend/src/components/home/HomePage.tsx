import { Button } from '@/components/ui/button'
import {
  ArrowRightIcon,
  GiftIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'

import {
  bestSellingProducts,
  editorialBanners,
  flashSaleProducts,
  homePromises,
  newProducts,
} from './home-data'
import { ProductCard } from './ProductCard'
import { SectionHeader } from './SectionHeader'

const categoryFilters = ['Tất cả', 'Đèn xông', 'Bộ quà', 'Tinh dầu cam']
const bestSellerTabs = ['Tháng này', 'Bán chạy', 'Top rating']

export function HomePage() {
  return (
    <div className="bg-[#fff7f2]">
      <div className="mx-auto max-w-[1240px] px-5 py-6 md:px-8 md:py-8">
        <CategoryBar />
        <HeroSection />
        <FlashSaleSection />
        <NewProductSection />
        <BestSellerSection />
        <EditorialBannerGrid />
        <PromiseSection />
      </div>
    </div>
  )
}

function CategoryBar() {
  return (
    <div className="mb-4 hidden items-center gap-4 text-xs font-medium text-stone-500 md:flex">
      {categoryFilters.map((item, index) => (
        <a
          key={item}
          href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
          className={cn(
            'transition hover:text-red-500',
            index === 0 && 'text-emerald-800',
          )}
        >
          {item}
        </a>
      ))}
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-lg bg-stone-950 text-white shadow-[0_20px_60px_rgba(17,24,39,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(244,63,94,0.32),transparent_30%),linear-gradient(120deg,rgba(12,10,9,0.98),rgba(28,25,23,0.92)_48%,rgba(4,47,46,0.78))]" />
      <div className="relative grid min-h-[320px] items-center gap-8 px-6 py-10 md:grid-cols-[1fr_430px] md:px-12 lg:min-h-[360px]">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">
            Bộ sưu tập tháng này
          </span>
          <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-normal md:text-5xl">
            Liệu Pháp Hương Thơm & Nghệ Thuật Pha Chế Tinh Dầu
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/76 md:text-base">
            Khám phá các dòng tinh dầu nguyên chất và nến thơm được tuyển chọn
            cho giấc ngủ, tập trung và chăm sóc không gian sống.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button className="h-10 gap-2 rounded-md bg-red-500 px-5 text-sm font-semibold text-white hover:bg-red-600">
              Trang bộ sưu tập
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-10 gap-2 rounded-md px-5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              Xem bộ quà tặng
            </Button>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="aspect-[1.34] overflow-hidden rounded-lg border border-white/16 bg-stone-800 shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
            <img
              src="https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?auto=format&fit=crop&w=900&q=82"
              alt="Không gian workshop pha chế tinh dầu"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-8 flex gap-2">
            <span className="h-1.5 w-8 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white/45" />
            <span className="size-1.5 rounded-full bg-white/45" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FlashSaleSection() {
  return (
    <section className="mt-8 rounded-lg border border-amber-200/80 bg-white p-4 shadow-[0_14px_36px_rgba(120,53,15,0.06)] md:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold uppercase text-stone-950">
            <GiftIcon className="size-4" />
            Flash sale
          </span>
          <div className="flex items-center gap-1">
            {['02', '18', '45'].map((time) => (
              <span
                key={time}
                className="grid size-7 place-items-center rounded bg-stone-900 text-xs font-bold text-white"
              >
                {time}
              </span>
            ))}
          </div>
          <p className="text-sm font-medium text-stone-500">
            Kết thúc trong hôm nay
          </p>
        </div>
        <a
          href="#flash-sale"
          className="text-sm font-semibold text-emerald-800 hover:text-red-500"
        >
          Xem tất cả ưu đãi
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {flashSaleProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="sale" />
        ))}
      </div>
    </section>
  )
}

function NewProductSection() {
  return (
    <section className="mt-10">
      <SectionHeader eyebrow="Bộ sưu tập mới nhất" title="Sản Phẩm Mới Về" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {newProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function BestSellerSection() {
  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-red-500">
            Được yêu thích nhất
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-stone-950">
            Top Sản Phẩm Bán Chạy
          </h2>
        </div>
        <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
          {bestSellerTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={cn(
                'h-8 rounded-full px-4 text-xs font-semibold text-stone-500 transition hover:text-stone-950',
                index === 0 && 'bg-stone-950 text-white hover:text-white',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bestSellingProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="sale" />
        ))}
      </div>
    </section>
  )
}

function EditorialBannerGrid() {
  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-2">
      {editorialBanners.map((banner) => (
        <article
          key={banner.title}
          className="group relative min-h-[180px] overflow-hidden rounded-lg bg-stone-950 p-6 text-white shadow-[0_16px_36px_rgba(31,41,55,0.16)]"
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/88 via-stone-950/42 to-transparent" />
          <div className="relative flex min-h-[132px] max-w-md flex-col justify-end">
            <p className="mb-2 text-xs font-bold uppercase text-amber-300">
              Bộ quà tặng
            </p>
            <h3 className="text-xl font-bold tracking-normal">
              {banner.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/78">
              {banner.description}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}

function PromiseSection() {
  return (
    <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6 text-center shadow-[0_16px_40px_rgba(31,41,55,0.06)] md:p-8">
      <h2 className="text-2xl font-bold tracking-normal text-stone-950">
        Cam Kết Từ Aura Essential
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-500">
        Từng sản phẩm đều được chọn lọc từ nguồn nguyên liệu tự nhiên, đóng gói
        cẩn thận và đồng hành cùng bạn trong những khoảnh khắc thư giãn hằng
        ngày.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {homePromises.map((promise) => (
          <article
            key={promise.title}
            className="rounded-lg border border-stone-100 bg-[#fffaf6] p-5"
          >
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-50 text-emerald-800">
              <promise.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-bold text-stone-950">
              {promise.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              {promise.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
