import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSprayCanSparkles } from '@fortawesome/free-solid-svg-icons';

export const ChatbotTypingIndicator: React.FC = () => {
  return (
    <div className="oilia-chat-msg-row bot">
      <div className="oilia-chat-msg-avatar" title="Oilia Assistant">
        <FontAwesomeIcon icon={faSprayCanSparkles} style={{ fontSize: '12px' }} />
      </div>
      <div className="oilia-chat-typing">
        <div className="oilia-chat-typing-dot" />
        <div className="oilia-chat-typing-dot" />
        <div className="oilia-chat-typing-dot" />
      </div>
    </div>
  );
};

