import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from './types';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatbotTypingIndicator } from './ChatbotTypingIndicator';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isTyping,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Chỉ cuộn nội dung chat, tránh kéo theo trang sản phẩm phía sau.
  useEffect(() => {
    const list = listRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list?.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? 'instant' : 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      ref={listRef}
      className="oilia-chat-messages-container"
      role="log"
      aria-label="Nội dung trò chuyện"
      aria-relevant="additions"
      aria-busy={isTyping}
    >
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}

      {isTyping && <ChatbotTypingIndicator />}
    </div>
  );
};
