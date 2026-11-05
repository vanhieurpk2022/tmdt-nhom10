import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, QuickReplyOption } from './types';
import { ROUTES } from '../../routes/routes';
import { streamChatMessage, sendChatMessage, lookupProducts } from '../../api/chatbotService';

export const INITIAL_QUICK_REPLIES: QuickReplyOption[] = [
  { id: 'scent', label: '🌸 Gợi ý mùi hương thanh mát', prompt: 'Gợi ý mùi hương thanh mát phù hợp hàng ngày' },
  { id: 'custom', label: '🧪 Cách đặt phối hương riêng', prompt: 'Tôi muốn tự phối hương nước hoa riêng như thế nào?' },
  { id: 'shipping', label: '🚚 Giao hàng & Đổi trả', prompt: 'Chính sách vận chuyển và đổi trả tại Oilia như thế nào?' },
  { id: 'workshop', label: '🏭 Khám phá các xưởng chế tác', prompt: 'Giới thiệu các xưởng chế tác mùi hương của Oilia' },
  { id: 'human', label: '📞 Kết nối chuyên viên tư vấn', prompt: 'Tôi cần gặp nhân viên tư vấn hỗ trợ' },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    sender: 'bot',
    text: 'Xin chào! 👋 Mình là **Oilia AI Assistant** – trợ lý tư vấn mùi hương và hỗ trợ khách hàng của Oilia.\n\nMình có thể giúp bạn tìm kiếm nốt hương yêu thích, hướng dẫn phối hương cá nhân hóa, hoặc giải đáp các thắc mắc về đơn hàng!',
    timestamp: new Date(),
    quickReplies: [
      'Gợi ý mùi hương thanh mát',
      'Cách đặt phối hương riêng',
      'Chính sách giao hàng',
      'Khám phá các xưởng chế tác'
    ]
  }
];

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('oilia_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore JSON parse error
    }
    return INITIAL_MESSAGES;
  });

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Save to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('oilia_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Hide tooltip after 10 seconds or when opened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const toggleChat = (forceOpen?: boolean) => {
    setIsOpen((prev) => {
      const next = forceOpen !== undefined ? forceOpen : !prev;
      if (next) {
        setIsMinimized(false);
        setShowTooltip(false);
        setHasUnread(false);
      }
      return next;
    });
  };

  const minimizeChat = () => {
    setIsMinimized((prev) => !prev);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const dismissTooltip = () => {
    setShowTooltip(false);
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      sessionStorage.removeItem('oilia_chat_history');
    } catch {
      // ignore
    }
  };

  // Trả lời dự phòng cục bộ khi FastAPI chưa khởi động hoặc gặp sự cố mạng
  const getFallbackResponse = (userText: string) => {
    const lower = userText.toLowerCase().trim();
    let replyText = '';
    let products = undefined;
    let quickReplies: string[] | undefined = undefined;

    if (
      lower.includes('chào') ||
      lower.includes('hi') ||
      lower.includes('hello') ||
      lower.includes('alo')
    ) {
      replyText =
        'Dạ em chào bạn ạ! 🌿 Bạn đang muốn tìm kiếm một nốt hương mới mẻ, tìm quà tặng người thương hay cần hỗ trợ thông tin đơn hàng? Hãy chia sẻ với em nhé!';
      quickReplies = ['Gợi ý mùi hương thanh mát', 'Tự thiết kế mùi hương', 'Ưu đãi hôm nay'];
    } else if (
      lower.includes('phối hương') ||
      lower.includes('chế tác') ||
      lower.includes('custom') ||
      lower.includes('tự tạo')
    ) {
      replyText =
        '✨ **Dịch vụ Phối Hương Độc Quyền tại Oilia:**\n\nBạn hoàn toàn có thể sáng tạo chai nước hoa mang dấu ấn cá nhân với 3 bước đơn giản:\n1. Chọn **nốt hương đầu, giữa và cuối** theo sở thích.\n2. Chọn **xưởng chế tác thủ công** đối tác của Oilia.\n3. Thêm tên và thông điệp riêng khắc lên thân chai.\n\n👉 Bạn có thể trải nghiệm ngay tại mục [**Phối hương**](/custom-scent) nhé!';
      quickReplies = ['Khám phá các xưởng chế tác', 'Gợi ý mùi hương thanh mát', 'Giá phối hương'];
    } else if (
      lower.includes('xưởng') ||
      lower.includes('factory') ||
      lower.includes('workshop')
    ) {
      replyText =
        '🏭 **Mạng lưới xưởng chế tác Oilia:**\n\nOilia liên kết cùng các nghệ nhân và phòng pha chế đạt tiêu chuẩn IFRA. Bạn có thể xem hồ sơ kinh nghiệm và đánh giá chất lượng tại trang [**Danh sách xưởng chế tác**](/factories).';
      quickReplies = ['Tự thiết kế mùi hương', 'Chính sách vận chuyển'];
    } else if (
      lower.includes('giao hàng') ||
      lower.includes('ship') ||
      lower.includes('vận chuyển') ||
      lower.includes('bao lâu')
    ) {
      replyText =
        '🚚 **Chính sách giao hàng của Oilia:**\n\n• **Nội thành**: 1 - 2 ngày làm việc.\n• **Các tỉnh thành khác**: 2 - 4 ngày làm việc.\n• **Freeship** toàn quốc cho đơn từ 500.000đ.\n• Khách hàng được đồng kiểm trước khi nhận hàng.';
      quickReplies = ['Chính sách đổi trả', 'Phương thức thanh toán', 'Tra cứu đơn hàng'];
    } else if (
      lower.includes('đổi trả') ||
      lower.includes('bảo hành') ||
      lower.includes('hoàn tiền') ||
      lower.includes('lỗi')
    ) {
      replyText =
        '📦 **Chính sách đổi trả & hoàn tiền:**\n\n• Hỗ trợ đổi mới 1:1 trong vòng **7 ngày** nếu chai vỡ, vòi xịt lỗi hoặc không đúng mùi.\n• Sản phẩm giữ nguyên tình trạng tem mác nguyên vẹn.';
      quickReplies = ['Liên hệ hỗ trợ', 'Tra cứu đơn hàng'];
    } else if (
      lower.includes('mùi hương') ||
      lower.includes('thơm') ||
      lower.includes('nước hoa') ||
      lower.includes('gợi ý')
    ) {
      replyText =
        '🌿 **Gợi ý dành riêng cho bạn:**\n\nDưới đây là những sáng tạo mùi hương đang được yêu thích nhất tại Oilia:';
      products = [
        {
          id: 1,
          name: 'Oilia Citrus Breeze - Cam Bergamot & Trà Xanh',
          price: 450000,
          originalPrice: 550000,
          imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80',
          category: 'Tinh dầu thanh mát',
          link: ROUTES.PRODUCTS
        },
        {
          id: 2,
          name: 'Oilia Velvet Rose - Hoa Hồng Damask & Gỗ Tuyết Tùng',
          price: 590000,
          originalPrice: 690000,
          imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=300&q=80',
          category: 'Hương sang trọng, quyến rũ',
          link: ROUTES.PRODUCTS
        }
      ];
      quickReplies = ['Cách đặt phối hương riêng', 'Xem tất cả sản phẩm', 'Chính sách giao hàng'];
    } else {
      replyText =
        'Dạ em đã ghi nhận câu hỏi của bạn. 🌿 Máy chủ AI Chatbot đang cập nhật, bạn có thể chọn các câu hỏi nhanh bên dưới hoặc liên hệ hotline **1900 6868** để được hỗ trợ tức thì nhé!';
      quickReplies = [
        'Gợi ý mùi hương thanh mát',
        'Cách đặt phối hương riêng',
        'Chính sách giao hàng & đổi trả',
        'Khám phá các xưởng chế tác'
      ];
    }

    return { replyText, products, quickReplies };
  };

  // Gửi tin nhắn qua FastAPI Chatbot Backend
  const sendMessage = async (text: string) => {
    if (!text || !text.trim()) return;

    const userText = text.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const botMsgId = `bot-${Date.now()}`;
    let isStreamStarted = false;
    let fullReply = '';

    try {
      // 1. Ưu tiên gọi Streaming qua FastAPI SSE
      await streamChatMessage(userText, (token) => {
        fullReply += token;
        if (!isStreamStarted) {
          isStreamStarted = true;
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: botMsgId,
              sender: 'bot',
              text: token,
              timestamp: new Date(),
            }
          ]);
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId ? { ...msg, text: msg.text + token } : msg
            )
          );
        }
      });

      // Trích xuất ID sản phẩm từ câu trả lời để lấy ảnh và hiển thị thẻ sản phẩm (Product Cards)
      const matches = [...fullReply.matchAll(/(?:\/product-detail\/|product_)(\d+)/g)];
      const ids = [...new Set(matches.map((m) => m[1]))];
      if (ids.length > 0) {
        const productItems = await lookupProducts(ids);
        if (productItems && productItems.length > 0) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId ? { ...msg, products: productItems } : msg
            )
          );
        }
      }
    } catch {
      // 2. Nếu streaming lỗi, thử gọi POST /api/chat thông thường
      try {
        const result = await sendChatMessage(userText);
        setIsTyping(false);
        setMessages((prev) => {
          const newBot: ChatMessage = {
            id: botMsgId,
            sender: 'bot',
            text: result.reply,
            timestamp: new Date(),
            products: result.products,
          };
          if (isStreamStarted) {
            return prev.map((msg) => (msg.id === botMsgId ? newBot : msg));
          }
          return [...prev, newBot];
        });
      } catch {
        // 3. Fallback sang logic dự phòng nếu FastAPI chưa bật
        setIsTyping(false);
        const fallback = getFallbackResponse(userText);
        setMessages((prev) => {
          if (isStreamStarted) {
            return prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    text: fallback.replyText,
                    products: fallback.products,
                    quickReplies: fallback.quickReplies
                  }
                : msg
            );
          }
          return [
            ...prev,
            {
              id: botMsgId,
              sender: 'bot',
              text: fallback.replyText,
              timestamp: new Date(),
              products: fallback.products,
              quickReplies: fallback.quickReplies
            }
          ];
        });
      }
    } finally {
      setIsTyping(false);
      if (!isOpenRef.current) {
        setHasUnread(true);
      }
    }
  };

  const handleQuickReply = (promptText: string) => {
    sendMessage(promptText);
  };

  return {
    isOpen,
    isMinimized,
    showTooltip,
    hasUnread,
    isTyping,
    messages,
    toggleChat,
    minimizeChat,
    closeChat,
    dismissTooltip,
    clearChat,
    sendMessage,
    handleQuickReply
  };
}
