import React from 'react';
import { ChatbotHeader } from './ChatbotHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatQuickReplies } from './ChatQuickReplies';
import { ChatbotInput } from './ChatbotInput';
import type { ChatMessage, QuickReplyOption } from './types';

interface ChatbotWindowProps {
  isMinimized: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  quickReplyOptions: QuickReplyOption[];
  onMinimize: () => void;
  onClose: () => void;
  onClear: () => void;
  onSend: (text: string) => void;
  onSelectQuickReply: (prompt: string) => void;
}

export const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
  isMinimized,
  messages,
  isTyping,
  quickReplyOptions,
  onMinimize,
  onClose,
  onClear,
  onSend,
  onSelectQuickReply,
}) => {
  return (
    <div
      className={`oilia-chat-window oilia-animate-in ${isMinimized ? 'minimized' : ''}`}
      role="region"
      aria-label="Cửa sổ trò chuyện trợ lý Oilia"
    >
      <ChatbotHeader
        isMinimized={isMinimized}
        onMinimize={onMinimize}
        onClose={onClose}
        onClear={onClear}
      />

      {!isMinimized && (
        <>
          <ChatMessageList
            messages={messages}
            isTyping={isTyping}
            onSelectQuickReply={onSelectQuickReply}
          />

          <ChatQuickReplies
            options={quickReplyOptions}
            onSelect={onSelectQuickReply}
          />

          <ChatbotInput
            onSend={onSend}
            disabled={isTyping}
          />
        </>
      )}
    </div>
  );
};
