import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-regular-svg-icons';

interface ChatbotToggleProps {
  hasUnread: boolean;
  showTooltip: boolean;
  onToggle: () => void;
  onDismissTooltip: () => void;
}

export const ChatbotToggle: React.FC<ChatbotToggleProps> = ({
  hasUnread,
  showTooltip,
  onToggle,
  onDismissTooltip,
}) => {
  return (
    <>
      {/* Tooltip / Bubble notification */}
      {showTooltip && (
        <div className="oilia-chat-tooltip" role="alert">
          <span>Bạn cần tư vấn chọn mùi hương? Nhắn cho mình nhé!</span>
          <button
            type="button"
            className="oilia-chat-tooltip-close"
            onClick={(e) => {
              e.stopPropagation();
              onDismissTooltip();
            }}
            aria-label="Đóng gợi ý"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        className="oilia-chat-toggle-btn"
        onClick={onToggle}
        aria-label="Mở hộp thoại tư vấn Oilia"
        title="Tư vấn mùi hương"
      >
        <FontAwesomeIcon icon={faComment} />
        
        {hasUnread && (
          <span className="oilia-chat-badge">1</span>
        )}
      </button>
    </>
  );
};

