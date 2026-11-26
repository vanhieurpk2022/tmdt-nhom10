import React from 'react';

export const ChatbotTypingIndicator: React.FC = () => {
  return (
    <div className="oilia-chat-msg-row bot" role="status" aria-label="Oilia đang trả lời">
      <div className="oilia-chat-typing" aria-hidden="true">
        <div className="oilia-chat-typing-dot" />
        <div className="oilia-chat-typing-dot" />
        <div className="oilia-chat-typing-dot" />
      </div>
    </div>
  );
};

