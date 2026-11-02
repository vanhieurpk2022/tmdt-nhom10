/**
 * Chatbot API Service kết nối với FastAPI (Oilia RAG Service)
 */

const CHATBOT_BASE_URL =
  (import.meta as any).env?.VITE_CHATBOT_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : '/api/chat');

export interface ChatbotProductItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  link?: string;
}

export interface ChatbotResponse {
  reply: string;
  products?: ChatbotProductItem[];
}

/**
 * Gửi tin nhắn đến FastAPI Chatbot và nhận câu trả lời cùng danh sách sản phẩm (có hình ảnh).
 */
export async function sendChatMessage(
  message: string
): Promise<{ reply: string; products?: ChatbotProductItem[] }> {
  const endpoints = ['/api/chat', `${CHATBOT_BASE_URL.replace(/\/+$/, '')}/api/chat`];

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data: ChatbotResponse = await response.json();
      if (data && typeof data.reply === 'string') {
        return {
          reply: data.reply,
          products: data.products,
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối đến máy chủ Chatbot AI');
}

/**
 * Tra cứu thông tin chi tiết (ảnh, giá, link) của sản phẩm theo danh sách ID
 */
export async function lookupProducts(ids: (number | string)[]): Promise<ChatbotProductItem[]> {
  if (!ids || ids.length === 0) return [];

  const idQuery = ids.join(',');
  const endpoints = [
    `/api/products/lookup?ids=${encodeURIComponent(idQuery)}`,
    `${CHATBOT_BASE_URL.replace(/\/+$/, '')}/api/products/lookup?ids=${encodeURIComponent(idQuery)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // ignore and try next
    }
  }
  return [];
}

/**
 * Streaming tin nhắn thời gian thực qua Server-Sent Events / Chunked Stream từ FastAPI.
 */
export async function streamChatMessage(
  message: string,
  onToken: (token: string) => void
): Promise<string> {
  const endpoints = [
    '/api/chat/stream',
    `${CHATBOT_BASE_URL.replace(/\/+$/, '')}/api/chat/stream`,
  ];

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;
        onToken(chunk);
      }

      return fullReply;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối đến máy chủ streaming Chatbot AI');
}

/**
 * Kiểm tra trạng thái máy chủ Chatbot FastAPI
 */
export async function checkChatbotHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${CHATBOT_BASE_URL.replace(/\/+$/, '')}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
