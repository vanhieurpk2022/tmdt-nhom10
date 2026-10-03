import { SiteLogo } from '@/components/layout/SiteLogo'
import { Button } from '@/components/ui/button'

const footerColumns = [
  {
    title: 'Categories',
    links: ['Fashion', 'Jewelry', 'Sports', 'Electronics', 'Indoor'],
  },
  {
    title: 'Shopping',
    links: ['Payments', 'Delivery options', 'Buyer protection'],
  },
  {
    title: 'Customer care',
    links: [
      'Help center',
      'Terms & Conditions',
      'Privacy policy',
      'Returns & refund',
      'Survey & Feedback',
    ],
  },
  {
    title: 'Pages',
    links: ['About Us', 'Shop', 'Contact Us', 'Services', 'Blog'],
  },
]

const socialLinks = ['f', 'x', 'ig', 'in']

export function Footer() {
  return (
    <footer className="w-full bg-white text-slate-950">
      <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.3fr_1fr]">
          <div className="max-w-[270px]">
            <SiteLogo
              className="mb-6"
              markClassName="size-10"
              textClassName="text-2xl"
            />
            <p className="text-[13px] leading-6 text-slate-600">
              Welcome to Estrella, where brilliance meets innovation. We are a
              leading company dedicated to delivering exceptional products and
              services to cater to your needs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="mb-4 text-sm font-bold">{column.title}</h2>
                <ul className="space-y-2.5 text-[13px] font-medium text-slate-700">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
                        className="transition hover:text-rose-600"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold">Subscribe Now</h2>
            <form className="flex overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <input
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none placeholder:text-slate-500"
                aria-label="Email nhận tin"
              />
              <Button
                type="submit"
                className="h-auto rounded-none bg-yellow-400 px-4 text-[11px] font-bold text-slate-950 hover:bg-yellow-300"
              >
                Submit
              </Button>
            </form>
            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="grid size-8 place-items-center rounded-full bg-slate-100 text-[11px] font-bold uppercase text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Theo dõi Oilia trên ${social}`}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-5 text-center text-[11px] font-medium text-slate-600">
          @ 2023 oilia Inc. All rights reserved
        </div>
      </div>
    </footer>
  )
}
