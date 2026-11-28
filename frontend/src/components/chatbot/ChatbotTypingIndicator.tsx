import React from 'react';

export const ChatbotTypingIndicator: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="oilia-chat-msg-row bot" role="status">
      <div className="oilia-chat-typing">
        <span className="oilia-chat-progress-label">{label}</span>
        <div className="oilia-chat-typing-dot" aria-hidden="true" />
        <div className="oilia-chat-typing-dot" aria-hidden="true" />
        <div className="oilia-chat-typing-dot" aria-hidden="true" />
      </div>
    </div>
  );
};

