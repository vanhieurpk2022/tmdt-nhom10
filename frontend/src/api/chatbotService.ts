import { readChatEvents, validateChatResponse, type ChatPhase } from './chatbotStream';

const CHATBOT_BASE_URL = (import.meta.env.VITE_CHATBOT_API_URL || '/chatbot').replace(/\/+$/, '');
// Model 3B chạy CPU cần chờ nạp ngữ cảnh; BE giới hạn toàn lượt ở 240 giây.
const CHAT_REQUEST_TIMEOUT_MS = 250_000;

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
  onPhase?: (phase: ChatPhase) => void,
): Promise<ChatbotResponse> {
  const combinedSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(CHAT_REQUEST_TIMEOUT_MS)])
    : AbortSignal.timeout(CHAT_REQUEST_TIMEOUT_MS);
  const options: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson, application/json' },
    body: JSON.stringify({ message, history: history.slice(-8) }),
    signal: combinedSignal,
  };
  let response = await fetch(CHATBOT_BASE_URL + '/api/chat/events', options);
  // Tương thích với dịch vụ cũ chưa có endpoint tiến trình; không gửi lại khi model đã xử lý.
  if (response.status === 404 || response.status === 405) response = await fetch(CHATBOT_BASE_URL + '/api/chat', options);
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const detail = data && typeof data === 'object' && 'detail' in data ? data.detail : null;
    throw new Error(typeof detail === 'string' ? detail : 'Chưa kết nối được trợ lý. Bạn thử lại sau nhé.');
  }
  if (response.headers.get('content-type')?.includes('application/x-ndjson')) {
    return readChatEvents(response, onPhase, combinedSignal);
  }
  return validateChatResponse(await response.json());
}

export async function checkChatbotHealth(): Promise<boolean> {
  try {
    const response = await fetch(CHATBOT_BASE_URL + '/health', { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}
