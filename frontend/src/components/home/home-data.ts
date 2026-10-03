import type { ComponentType, SVGProps } from 'react'

import {
  CreditCardIcon,
  LeafIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@/components/ui/icons'

export type HomeProduct = {
  id: number
  name: string
  shortDescription: string
  price: number
  oldPrice?: number
  image: string
  tag?: string
  rating?: number
  sold?: number
}

export type HomePromise = {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const flashSaleProducts: HomeProduct[] = [
  {
    id: 1,
    name: 'Dầu Hương Thảo Lavender Pháp',
    shortDescription: 'Thư giãn tinh thần, hỗ trợ giấc ngủ sâu.',
    price: 189000,
    oldPrice: 240000,
    image:
      'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=700&q=80',
    tag: '-21%',
    rating: 4.8,
    sold: 128,
  },
  {
    id: 2,
    name: 'Essential Oil Lychee & Vanilla',
    shortDescription: 'Hương trái cây ngọt dịu cho phòng ngủ.',
    price: 210000,
    oldPrice: 260000,
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80',
    tag: '-19%',
    rating: 4.7,
    sold: 94,
  },
  {
    id: 3,
    name: 'Tinh Dầu Tea Tree Hữu Cơ',
    shortDescription: 'Thanh lọc không khí, hương xanh mát.',
    price: 165000,
    oldPrice: 205000,
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',
    tag: '-20%',
    rating: 4.9,
    sold: 176,
  },
  {
    id: 4,
    name: 'Bạc Hà Tươi Peppermint',
    shortDescription: 'Tỉnh táo, sảng khoái cho góc làm việc.',
    price: 150000,
    oldPrice: 190000,
    image:
      'https://images.unsplash.com/photo-1611073061677-3811ffb06ef1?auto=format&fit=crop&w=700&q=80',
    tag: '-18%',
    rating: 4.6,
    sold: 88,
  },
]

export const newProducts: HomeProduct[] = [
  {
    id: 5,
    name: 'Tinh Dầu Deep Sleep 10ml',
    shortDescription: 'Blend nhẹ nhàng cho buổi tối thư thái.',
    price: 245000,
    image:
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=700&q=80',
    tag: 'New',
  },
  {
    id: 6,
    name: 'Sáp Thơm Đồng Thiên Nhiên',
    shortDescription: 'Hương gỗ ấm, phù hợp bàn làm việc.',
    price: 330000,
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80',
    tag: 'New',
  },
  {
    id: 7,
    name: 'Tinh Dầu Herbal Balance',
    shortDescription: 'Cân bằng không gian sống mỗi ngày.',
    price: 270000,
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=80',
    tag: 'New',
  },
  {
    id: 8,
    name: 'Pillow Mist Tea & Chamomile',
    shortDescription: 'Xịt thơm gối, hương trà hoa cúc dịu.',
    price: 185000,
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80',
    tag: 'New',
  },
]

export const bestSellingProducts: HomeProduct[] = [
  {
    id: 9,
    name: 'Tinh Dầu Lá Chanh Lemongrass',
    shortDescription: 'Mùi hương tươi sáng cho phòng khách.',
    price: 145000,
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    sold: 312,
  },
  {
    id: 10,
    name: 'Tinh Dầu Bạc Hà Peppermint',
    shortDescription: 'Mát lạnh, giúp tỉnh táo khi học tập.',
    price: 160000,
    image:
      'https://images.unsplash.com/photo-1611073061677-3811ffb06ef1?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    sold: 286,
  },
  {
    id: 11,
    name: 'Tinh Dầu Thảo Dược Nguyên Chất',
    shortDescription: 'Hương tự nhiên, dùng cùng máy khuếch tán.',
    price: 135000,
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    sold: 221,
  },
  {
    id: 12,
    name: 'Tinh Dầu Gừng Ấm Nồng',
    shortDescription: 'Nốt cay ấm cho ngày mưa và phòng ngủ.',
    price: 155000,
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    sold: 198,
  },
]

export const editorialBanners = [
  {
    title: 'Combo Máy Xông Siêu Âm & Tinh Dầu Trị Liệu',
    description: 'Tạo một góc thư giãn đúng nghĩa chỉ trong vài phút.',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Hộp Quà Thơm Chữa Lành Cho Người Thương',
    description: 'Món quà nhỏ, cảm giác ấm áp và rất dễ dùng.',
    image:
      'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80',
  },
]

export const homePromises: HomePromise[] = [
  {
    title: '100% Tinh Khiết',
    description: 'Chọn lọc nguyên liệu đạt chuẩn.',
    icon: LeafIcon,
  },
  {
    title: 'Không Hương Liệu',
    description: 'Không pha màu, không hương tổng hợp.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Nhận Hàng Trả Tiền',
    description: 'Kiểm tra trước khi thanh toán.',
    icon: CreditCardIcon,
  },
  {
    title: 'Đổi Trả 48h',
    description: 'Hỗ trợ đổi trả khi có lỗi sản phẩm.',
    icon: TruckIcon,
  },
]
