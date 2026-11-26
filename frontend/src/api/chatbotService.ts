const CHATBOT_BASE_URL = (import.meta.env.VITE_CHATBOT_API_URL || '/chatbot').replace(/\/+$/, '');

export interface ChatbotProductItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  link?: string;
  factoryName?: string;
  volumeMl?: number;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotResponse {
  reply: string;
  products?: ChatbotProductItem[];
}

export async function sendChatMessage(
  message: string,
  history: HistoryMessage[] = [],
  signal?: AbortSignal,
): Promise<ChatbotResponse> {
  const response = await fetch(CHATBOT_BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ message, history: history.slice(-8) }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const detail = data && typeof data === 'object' && 'detail' in data ? data.detail : null;
    throw new Error(typeof detail === 'string' ? detail : 'Chưa kết nối được trợ lý. Bạn thử lại sau nhé.');
  }
  const data: ChatbotResponse = await response.json();
  if (typeof data.reply !== 'string') throw new Error('Phản hồi trợ lý không hợp lệ');
  return data;
}

export async function checkChatbotHealth(): Promise<boolean> {
  try {
    const response = await fetch(CHATBOT_BASE_URL + '/health', { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}
