import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import type { ChatMessage } from './types';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatbotTypingIndicator } from './ChatbotTypingIndicator';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSelectQuickReply: (prompt: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isTyping,
  onSelectQuickReply,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom whenever a message arrives or typing changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="oilia-chat-messages-container">
      {/* Welcome introduction card */}
      <div className="oilia-chat-welcome-banner">
        <div className="oilia-chat-welcome-icon">
          <FontAwesomeIcon icon={faWandMagicSparkles} />
        </div>
        <h4 className="oilia-chat-welcome-title">Chào mừng bạn đến với Oilia!</h4>
        <p className="oilia-chat-welcome-desc">
          Thế giới hương thơm cao cấp & trải nghiệm phối hương chế tác mang dấu ấn riêng của bạn.
        </p>
      </div>

      {/* Render messages */}
      {messages.map((msg, index) => {
        const isLastBotMessage =
          msg.sender === 'bot' &&
          (index === messages.length - 1 ||
            (index === messages.length - 2 && messages[messages.length - 1].sender === 'user'));

        return (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onSelectQuickReply={isLastBotMessage ? onSelectQuickReply : undefined}
          />
        );
      })}

      {/* Typing indicator */}
      {isTyping && <ChatbotTypingIndicator />}

      <div ref={bottomRef} style={{ height: '1px' }} />
    </div>
  );
};
