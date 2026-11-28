import type { ChatbotProductItem, ChatbotResponse } from './chatbotService';

export type ChatPhase = 'understanding' | 'searching' | 'writing';

export const CHAT_PHASE_LABELS: Record<ChatPhase, string> = {
  understanding: 'Đang xem yêu cầu của bạn…',
  searching: 'Đang đối chiếu sản phẩm phù hợp…',
  writing: 'Đang soạn lời tư vấn…',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateChatResponse(value: unknown): ChatbotResponse {
  if (!isRecord(value) || typeof value.reply !== 'string' || value.reply.length > 100_000
    || (value.products != null && (!Array.isArray(value.products) || value.products.length > 12))) {
    throw new Error('Phản hồi trợ lý không hợp lệ.');
  }
  const products: ChatbotProductItem[] = [];
  for (const product of (value.products ?? []) as unknown[]) {
    if (!isRecord(product) || typeof product.name !== 'string' || !product.name.trim()
      || typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0
      || !((typeof product.id === 'number' && Number.isSafeInteger(product.id) && product.id > 0)
        || (typeof product.id === 'string' && /^[1-9]\d*$/.test(product.id)))) {
      throw new Error('Thông tin sản phẩm trong câu trả lời không hợp lệ.');
    }
    const item: ChatbotProductItem = { id: product.id as number | string, name: product.name, price: product.price };
    for (const key of ['imageUrl', 'category', 'link', 'factoryName'] as const) {
      if (typeof product[key] === 'string') item[key] = product[key];
    }
    if (typeof product.volumeMl === 'number' && Number.isFinite(product.volumeMl) && product.volumeMl > 0) {
      item.volumeMl = product.volumeMl;
    }
    products.push(item);
  }
  return { reply: value.reply, products };
}

export async function readChatEvents(
  response: Response,
  onPhase?: (phase: ChatPhase) => void,
  signal?: AbortSignal,
): Promise<ChatbotResponse> {
  if (!response.body) throw new Error('Trợ lý chưa gửi được câu trả lời.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const cancel = () => { void reader.cancel().catch(() => {}); };
  const parseLine = (line: string): ChatbotResponse | undefined => {
    if (!line.trim()) return;
    let event: unknown;
    try { event = JSON.parse(line); }
    catch { throw new Error('Phản hồi trợ lý không hợp lệ.'); }
    if (!isRecord(event)) throw new Error('Phản hồi trợ lý không hợp lệ.');
    if (event.type === 'error') {
      throw new Error(typeof event.detail === 'string' ? event.detail : 'Chưa lấy được câu trả lời.');
    }
    if (event.type === 'status' && typeof event.phase === 'string' && Object.hasOwn(CHAT_PHASE_LABELS, event.phase)) {
      onPhase?.(event.phase as ChatPhase);
    }
    if (event.type === 'result') return validateChatResponse(event);
  };
  try {
    signal?.throwIfAborted();
    signal?.addEventListener('abort', cancel, { once: true });
    while (true) {
      const { done, value } = await reader.read();
      signal?.throwIfAborted();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 262_144) throw new Error('Câu trả lời quá dài. Bạn thử hỏi cụ thể hơn nhé.');
      let newline: number;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const result = parseLine(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
        if (result) return result;
      }
      if (done) break;
    }
    const result = parseLine(buffer);
    if (result) return result;
    throw new Error('Kết nối bị ngắt trước khi trợ lý trả lời xong. Bạn thử lại nhé.');
  } finally {
    signal?.removeEventListener('abort', cancel);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
