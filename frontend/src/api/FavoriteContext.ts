import { createContext, useContext } from 'react';
import type { ProductCard } from './ProductService';

export const FavoriteContext = createContext<{
  products: ProductCard[];
  loading: boolean;
  error: string;
  toggle: (id: number) => Promise<void>;
} | null>(null);

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) throw new Error('FavoriteProvider chưa được khởi tạo');
  return context;
}
