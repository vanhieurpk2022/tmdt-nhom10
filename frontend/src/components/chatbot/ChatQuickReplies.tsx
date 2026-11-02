import React from 'react';
import type { QuickReplyOption } from './types';

interface ChatQuickRepliesProps {
  options: QuickReplyOption[];
  onSelect: (prompt: string) => void;
}

export const ChatQuickReplies: React.FC<ChatQuickRepliesProps> = ({
  options,
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
          onClick={() => onSelect(option.prompt)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
