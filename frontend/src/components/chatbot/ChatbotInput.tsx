import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface ChatbotInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatbotInput: React.FC<ChatbotInputProps> = ({
  onSend,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;

    onSend(inputText.trim());
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="oilia-chat-footer" onSubmit={handleSubmit}>
      <div className="oilia-chat-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="oilia-chat-input"
          placeholder="Nhập câu hỏi của bạn..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={500}
        />
      </div>

      <button
        type="submit"
        className="oilia-chat-send-btn"
        disabled={disabled || !inputText.trim()}
        title="Gửi tin nhắn"
        aria-label="Gửi tin nhắn"
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </form>
  );
};

