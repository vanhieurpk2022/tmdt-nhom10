import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import api from './api';
import { useAuth } from './AuthContext';
import { FavoriteContext } from './FavoriteContext';
import type { ProductCard } from './ProductService';

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<{ account?: string; products: ProductCard[]; error: string }>({ products: [], error: '' });
  const pending = useRef(new Set<string>());
  const account = useRef(userId);
  useEffect(() => { account.current = userId; }, [userId]);
  const products = snapshot.account === userId ? snapshot.products : [];
  const error = snapshot.account === userId ? snapshot.error : '';
  const loading = Boolean(userId && snapshot.account !== userId);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void api.get<{ data: ProductCard[] }>('/favorites')
      .then(response => { if (active) setSnapshot({ account: userId, products: response.data.data, error: '' }); })
      .catch(() => { if (active) setSnapshot({ account: userId, products: [], error: 'Chưa tải được sản phẩm yêu thích.' }); });
    return () => { active = false; };
  }, [userId]);

  const toggle = async (id: number) => {
    if (!userId) { navigate('/login', { state: { from: location } }); return; }
    const pendingKey = userId + ':' + id;
    if (pending.current.has(pendingKey)) return;
    pending.current.add(pendingKey);
    try {
      if (products.some(p => p.id === id)) await api.delete('/favorites/' + id);
      else await api.put('/favorites/' + id);
      const response = await api.get<{ data: ProductCard[] }>('/favorites');
      if (account.current === userId) setSnapshot({ account: userId, products: response.data.data, error: '' });
    } catch {
      if (account.current === userId) setSnapshot(previous => ({ ...previous, account: userId, error: 'Chưa cập nhật được yêu thích. Bạn thử lại nhé.' }));
    } finally { pending.current.delete(pendingKey); }
  };
  return <FavoriteContext.Provider value={{ products, loading, error, toggle }}>{children}</FavoriteContext.Provider>;
}
