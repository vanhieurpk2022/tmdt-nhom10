import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

type AppLayoutProps = {
  children: ReactNode
  defaultAccountOpen?: boolean
}

export function AppLayout({
  children,
  defaultAccountOpen = false,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fff1f1] text-foreground">
      <Header defaultAccountOpen={defaultAccountOpen} />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
