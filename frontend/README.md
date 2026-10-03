# Frontend TMDT

Đây là phần giao diện của đồ án thương mại điện tử. Frontend đang dùng React, TypeScript, Vite, Tailwind CSS và shadcn/ui.

## Công nghệ sử dụng

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- lucide-react

## Cài đặt lần đầu

Mở terminal tại thư mục gốc project, sau đó chạy:

```bash
cd frontend
npm install
```

Lệnh `npm install` sẽ cài toàn bộ thư viện trong `package.json`.

## Chạy giao diện khi code

Trong thư mục `frontend`, chạy:

```bash
npm run dev
```

Sau khi chạy thành công, Vite sẽ in ra đường dẫn trong terminal. Thường là:

```text
http://localhost:5173/
```

Hoặc:

```text
http://127.0.0.1:5173/
```

Mở một trong hai đường dẫn đó trên trình duyệt để xem giao diện.

## Kiểm tra trước khi commit

Nên chạy lần lượt từng lệnh, không chạy song song:

```bash
npm run lint
npm run build
```

Trong đó:

- `npm run lint`: kiểm tra lỗi code style và một số lỗi React/TypeScript cơ bản.
- `npm run build`: kiểm tra frontend có build production thành công không.

## Cấu trúc thư mục quan trọng

```text
frontend/src
├── components
│   ├── layout          # Header, Footer, AppLayout
│   └── ui              # Component shadcn/ui và icon dùng chung
├── lib
│   └── utils.ts        # Hàm tiện ích, hiện có hàm cn()
├── App.tsx             # Component gốc
├── index.css           # Tailwind theme và CSS global
└── main.tsx            # Điểm render React app
```

Sau này khi làm các màn hình thật, có thể mở rộng thêm:

```text
frontend/src
├── data                # Mock data
├── pages               # HomePage, CartPage, CheckoutPage...
└── services            # API service sau này nối backend
```

## Import bằng alias

Project đã cấu hình alias `@` trỏ tới thư mục `src`.

Ví dụ:

```tsx
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'
```

Không cần import kiểu dài như:

```tsx
import { Button } from '../../components/ui/button'
```

## Tailwind CSS

Tailwind đã được cấu hình trong:

```text
src/index.css
vite.config.ts
```

Khi code giao diện, ưu tiên dùng class Tailwind trực tiếp:

```tsx
<div className="flex items-center justify-between rounded-md border p-4">
  Nội dung
</div>
```

## shadcn/ui

File cấu hình shadcn nằm ở:

```text
components.json
```

Component shadcn nên đặt trong:

```text
src/components/ui
```

Hiện project đã có sẵn:

```text
src/components/ui/button.tsx
```

Ví dụ sử dụng:

```tsx
import { Button } from '@/components/ui/button'

export function Example() {
  return <Button>Đặt hàng</Button>
}
```

## Thêm component shadcn mới

Khi cần thêm component như `card`, `input`, `badge`, `sheet`, chạy trong thư mục `frontend`:

```bash
npx shadcn@latest add card input badge sheet separator
```

Có thể thêm từng component riêng:

```bash
npx shadcn@latest add card
```

## Quy ước khi code giao diện

- Dùng Tailwind CSS làm style chính.
- Dùng shadcn/ui cho các component phổ biến như button, card, input, dialog, sheet, badge.
- Không nên trộn Bootstrap vào giao diện mới nếu không thật sự cần.
- Tách layout dùng chung vào `components/layout`.
- Tách từng màn hình vào `pages`.
- Giai đoạn hiện tại ưu tiên dùng mock data, chưa cần gọi backend thật.

## Lệnh thường dùng

```bash
npm install      # Cài thư viện
npm run dev      # Chạy frontend khi code
npm run lint     # Kiểm tra lint
npm run build    # Kiểm tra build production
```
