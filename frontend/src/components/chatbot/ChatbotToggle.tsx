import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faXmark } from '@fortawesome/free-solid-svg-icons';

interface ChatbotToggleProps {
  isOpen: boolean;
  hasUnread: boolean;
  showTooltip: boolean;
  onToggle: () => void;
  onDismissTooltip: () => void;
}

export const ChatbotToggle: React.FC<ChatbotToggleProps> = ({
  isOpen,
  hasUnread,
  showTooltip,
  onToggle,
  onDismissTooltip,
}) => {
  return (
    <>
      {/* Tooltip / Bubble notification */}
      {showTooltip && !isOpen && (
        <div className="oilia-chat-tooltip" role="alert">
          <span>🌿 Bạn cần tư vấn chọn hương nước hoa? Nhắn cho mình nhé!</span>
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
        aria-label={isOpen ? 'Đóng hộp thoại tư vấn' : 'Mở hộp thoại tư vấn Oilia'}
        title={isOpen ? 'Đóng hộp thoại' : 'Tư vấn mùi hương trực tuyến'}
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faCommentDots} />
        
        {hasUnread && !isOpen && (
          <span className="oilia-chat-badge">1</span>
        )}
      </button>
    </>
  );
};

