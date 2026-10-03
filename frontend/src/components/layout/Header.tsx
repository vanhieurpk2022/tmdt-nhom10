import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/layout/SiteLogo'
import {
  BellIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  LifeBuoyIcon,
  LogoutIcon,
  MenuIcon,
  MessageCircleIcon,
  PackageCheckIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UserIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Tất cả', href: '#tat-ca' },
  { label: 'Xưởng', href: '#xuong' },
  { label: 'Bộ sản phẩm', href: '#bo-san-pham' },
  { label: 'Ưu đãi', href: '#uu-dai', active: true },
]

const accountMenuItems = [
  {
    label: 'Hồ sơ cá nhân',
    href: '#ho-so-ca-nhan',
    icon: UserIcon,
    active: true,
  },
  {
    label: 'Đơn hàng của tôi',
    href: '#don-hang-cua-toi',
    icon: PackageCheckIcon,
    badge: '3 đang giao',
  },
  {
    label: 'Sản phẩm yêu thích',
    href: '#san-pham-yeu-thich',
    icon: HeartIcon,
  },
  {
    label: 'Cộng đồng người sành',
    href: '#cong-dong',
    icon: MessageCircleIcon,
    badge: '+ Mới',
  },
  {
    label: 'Cài đặt tài khoản',
    href: '#cai-dat-tai-khoan',
    icon: SettingsIcon,
  },
  {
    label: 'Trung tâm hỗ trợ',
    href: '#trung-tam-ho-tro',
    icon: LifeBuoyIcon,
    meta: '24/7',
  },
]

type HeaderProps = {
  defaultAccountOpen?: boolean
}

export function Header({ defaultAccountOpen = false }: HeaderProps) {
  const [isAccountOpen, setIsAccountOpen] = useState(defaultAccountOpen)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <header className="relative z-30 w-full bg-white shadow-[0_1px_0_rgba(15,23,42,0.05)]">
      <div className="bg-slate-950 text-white">
        <div className="mx-auto flex h-7 max-w-[1240px] items-center justify-between px-5 text-[10px] font-medium uppercase tracking-normal md:px-8">
          <div className="hidden w-44 md:block" />
          <p className="truncate text-center">
            Free shipping on orders over $150&nbsp;&nbsp; - &nbsp;&nbsp;Sử dụng
            mã: TINHDAU10 giảm 10%
          </p>
          <a
            href="#ho-tro"
            className="hidden w-44 justify-end text-[10px] font-medium normal-case text-white/75 transition hover:text-white md:flex"
          >
            Help &amp; Support
          </a>
        </div>
      </div>

      <div className="mx-auto flex min-h-20 max-w-[1240px] items-center gap-5 px-5 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <SiteLogo />

          <nav
            className="hidden items-center gap-8 text-[13px] font-medium lg:flex"
            aria-label="Điều hướng chính"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'text-slate-950 transition hover:text-rose-600',
                  item.active && 'font-semibold text-rose-600',
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <form className="hidden w-[360px] items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 shadow-inner md:flex xl:w-[430px]">
          <SearchIcon
            className="mr-3 size-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Tìm kiếm tinh dầu, thương hiệu..."
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
            aria-label="Tìm kiếm sản phẩm"
          />
          <kbd className="ml-3 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 shadow-sm">
            ⌘K
          </kbd>
        </form>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full px-2 py-1.5 text-left transition hover:bg-slate-50"
              onClick={() => setIsAccountOpen((value) => !value)}
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
                MH
              </span>
              <span className="hidden leading-tight xl:block">
                <span className="block text-[13px] font-semibold text-slate-950">
                  Anh Hàn
                  <span className="ml-1 text-[10px] font-bold text-rose-500">
                    VIP
                  </span>
                </span>
                <span className="block text-[11px] text-slate-500">
                  anhhan@oilia.vn
                </span>
              </span>
              <ChevronDownIcon
                className={cn(
                  'size-4 text-slate-400 transition',
                  isAccountOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>

            {isAccountOpen && <AccountMenu />}
          </div>

          <a
            href="#gio-hang"
            className="group flex items-center gap-2 rounded-full px-1 py-1 transition hover:bg-slate-50"
            aria-label="Giỏ hàng có tổng tiền 189.000 đồng"
          >
            <span className="relative grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-950">
              <ShoppingBagIcon className="size-5" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                2
              </span>
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[11px] font-semibold uppercase text-slate-950">
                Cart
              </span>
              <span className="block text-[12px] font-semibold text-slate-950">
                $189.00
              </span>
            </span>
          </a>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen((value) => !value)}
            aria-expanded={isMobileOpen}
            aria-label="Mở menu"
          >
            {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
          </Button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-lg lg:hidden">
          <form className="mb-4 flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5">
            <SearchIcon
              className="mr-3 size-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Tìm kiếm tinh dầu..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              aria-label="Tìm kiếm sản phẩm"
            />
          </form>
          <nav className="grid gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-slate-700 transition hover:bg-slate-50',
                  item.active && 'bg-rose-50 text-rose-600',
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

function AccountMenu() {
  return (
    <div
      className="absolute right-0 top-[calc(100%+18px)] w-[314px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] ring-1 ring-slate-950/5"
      role="menu"
      aria-label="Menu tài khoản"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="grid size-11 place-items-center rounded-full bg-rose-500 text-sm font-bold text-white">
          MH
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            Anh Hàn
            <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600">
              VIP
            </span>
          </p>
          <p className="truncate text-xs text-slate-500">anhhan@oilia.vn</p>
        </div>
        <BellIcon className="ml-auto size-4 text-rose-500" aria-hidden="true" />
      </div>

      <nav className="py-2">
        {accountMenuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              'mx-2 flex min-h-12 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950',
              item.active && 'bg-rose-50 text-rose-600',
            )}
            role="menuitem"
          >
            <span
              className={cn(
                'grid size-7 place-items-center rounded-full bg-slate-50 text-slate-500',
                item.active && 'bg-white text-rose-500',
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {item.badge}
              </span>
            )}
            {item.meta && (
              <span className="text-[11px] font-medium text-slate-400">
                {item.meta}
              </span>
            )}
          </a>
        ))}
      </nav>

      <a
        href="#dang-xuat"
        className="mx-2 mb-2 flex min-h-12 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
        role="menuitem"
      >
        <span className="grid size-7 place-items-center rounded-full bg-rose-50 text-rose-500">
          <LogoutIcon className="size-4" aria-hidden="true" />
        </span>
        Đăng xuất
      </a>
    </div>
  )
}
