import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, QuickReplyOption } from './types';
import { sendChatMessage, type HistoryMessage } from '../../api/chatbotService';
import { faLeaf, faTag, faFlask, faIndustry } from '@fortawesome/free-solid-svg-icons';

export const INITIAL_QUICK_REPLIES: QuickReplyOption[] = [
  { id: 'scent', label: 'Mùi hương thanh mát', icon: faLeaf, prompt: 'Gợi ý mùi hương thanh mát' },
  { id: 'budget', label: 'Dưới 300.000đ', icon: faTag, prompt: 'Tìm tinh dầu dưới 300.000đ' },
  { id: 'custom', label: 'Cách phối hương', icon: faFlask, prompt: 'Cách đặt phối hương riêng như thế nào?' },
  { id: 'workshop', label: 'Xưởng sản xuất', icon: faIndustry, prompt: 'Danh sách các xưởng sản xuất' },
];

export const INITIAL_MESSAGES: ChatMessage[] = [{
  id: 'welcome',
  sender: 'bot',
  text: 'Chào bạn! Mình có thể tìm tinh dầu theo mùi hương, xưởng, dung tích và ngân sách. Bạn đang muốn tìm loại nào?',
  timestamp: new Date(),
}];

const STORAGE_KEY = 'oilia_chat_history_v2';

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) {
        const valid = saved.filter((m): m is ChatMessage => !!m && typeof m === 'object'
          && typeof m.id === 'string' && typeof m.text === 'string'
          && (m.sender === 'bot' || m.sender === 'user'));
        if (valid.length) return valid.slice(-40);
      }
    } catch { /* Khởi tạo hội thoại mới khi dữ liệu lưu không hợp lệ. */ }
    return INITIAL_MESSAGES;
  });
  const request = useRef<AbortController | null>(null);
  const isOpenRef = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); }
    catch { /* Không chặn chat khi bộ nhớ trình duyệt đầy. */ }
  }, [messages]);
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 10000);
    return () => { clearTimeout(timer); request.current?.abort(); };
  }, []);

  const toggleChat = (forceOpen?: boolean) => {
    const next = forceOpen ?? !isOpen;
    setIsOpen(next);
    if (next) { setIsMinimized(false); setShowTooltip(false); setHasUnread(false); }
  };
  const clearChat = () => {
    request.current?.abort();
    request.current = null;
    setIsTyping(false);
    setMessages(INITIAL_MESSAGES);
  };
  const sendMessage = async (text: string) => {
    const content = text.trim().slice(0, 2000);
    if (!content || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const history: HistoryMessage[] = messages.filter(m => m.id !== 'welcome')
      .slice(-8).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text.slice(0, 2000) }));
    setMessages(previous => [...previous, {
      id: crypto.randomUUID(), sender: 'user', text: content, timestamp: new Date(),
    }]);
    setIsTyping(true);
    try {
      const result = await sendChatMessage(content, history, controller.signal);
      if (!controller.signal.aborted) setMessages(previous => [...previous, {
        id: crypto.randomUUID(), sender: 'bot', text: result.reply,
        products: result.products, timestamp: new Date(),
      }]);
    } catch (error) {
      if (!controller.signal.aborted) setMessages(previous => [...previous, {
        id: crypto.randomUUID(), sender: 'bot', timestamp: new Date(),
        text: error instanceof Error && error.name !== 'TimeoutError'
          ? error.message : 'Trợ lý phản hồi chậm. Bạn thử gửi lại sau nhé.',
      }]);
    } finally {
      if (request.current === controller) {
        request.current = null;
        setIsTyping(false);
        if (!isOpenRef.current) setHasUnread(true);
      }
    }
  };
  return {
    isOpen, isMinimized, showTooltip, hasUnread, isTyping, messages, toggleChat, clearChat, sendMessage,
    minimizeChat: () => setIsMinimized(previous => !previous),
    closeChat: () => { setIsOpen(false); setIsMinimized(false); },
    dismissTooltip: () => setShowTooltip(false),
    handleQuickReply: (text: string) => { void sendMessage(text); },
  };
}
