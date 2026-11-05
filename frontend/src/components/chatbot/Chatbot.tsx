import React from 'react';
import './chatbot.css';
import { useChatbot, INITIAL_QUICK_REPLIES } from './useChatbot';
import { ChatbotToggle } from './ChatbotToggle';
import { ChatbotWindow } from './ChatbotWindow';
import type { QuickReplyOption } from './types';

export interface ChatbotProps {
  customQuickReplies?: QuickReplyOption[];
}

export const Chatbot: React.FC<ChatbotProps> = ({
  customQuickReplies = INITIAL_QUICK_REPLIES,
}) => {
  const {
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
    handleQuickReply,
  } = useChatbot();

  return (
    <div className="oilia-chatbot-container">
      {isOpen && (
        <ChatbotWindow
          isMinimized={isMinimized}
          messages={messages}
          isTyping={isTyping}
          quickReplyOptions={customQuickReplies}
          onMinimize={minimizeChat}
          onClose={closeChat}
          onClear={clearChat}
          onSend={sendMessage}
          onSelectQuickReply={handleQuickReply}
        />
      )}

      <ChatbotToggle
        isOpen={isOpen}
        hasUnread={hasUnread}
        showTooltip={showTooltip}
        onToggle={() => toggleChat()}
        onDismissTooltip={dismissTooltip}
      />
    </div>
  );
};

export default Chatbot;
