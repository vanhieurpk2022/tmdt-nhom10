import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Tailwind CSS + shadcn/ui
          </p>
          <h1 className="text-4xl font-semibold text-balance md:text-5xl">
            Frontend foundation is ready
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            This screen is a small setup check. Next we can replace it with the
            shared layout, header, footer, and ecommerce pages.
          </p>
        </div>
        <Button>Start building UI</Button>
      </section>
    </main>
  )
}

export default App
