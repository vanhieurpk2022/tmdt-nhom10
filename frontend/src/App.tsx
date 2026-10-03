import { AppLayout } from '@/components/layout/AppLayout'

function App() {
  return (
    <AppLayout defaultAccountOpen>
      <section className="mx-auto flex min-h-[520px] max-w-[1240px] items-center px-5 py-16 md:px-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase text-rose-600">
            Layout preview
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">
            Header và footer đã sẵn sàng cho các trang ecommerce.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Đây là vùng nội dung tạm để kiểm tra khung giao diện. Các trang
            Home, Cart, Checkout và Order History sẽ được đặt vào giữa layout
            này ở bước tiếp theo.
          </p>
        </div>
      </section>
    </AppLayout>
  )
}

export default App
