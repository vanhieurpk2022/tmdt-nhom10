import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { QuickReplyOption } from './types';

interface ChatQuickRepliesProps {
  options: QuickReplyOption[];
  disabled?: boolean;
  onSelect: (prompt: string) => void;
}

export const ChatQuickReplies: React.FC<ChatQuickRepliesProps> = ({
  options,
  disabled = false,
  onSelect,
}) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="oilia-chat-quick-replies" role="group" aria-label="Gợi ý câu hỏi nhanh">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="oilia-chat-quick-chip"
          title={option.prompt}
          aria-label={option.prompt}
          disabled={disabled}
          onClick={() => onSelect(option.prompt)}
        >
          {option.icon && <FontAwesomeIcon icon={option.icon} aria-hidden="true" />}
          <span className="oilia-chat-quick-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
