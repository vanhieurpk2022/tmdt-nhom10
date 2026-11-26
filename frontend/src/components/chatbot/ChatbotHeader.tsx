import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faRotateRight,
  faMinus,
  faChevronUp,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

interface ChatbotHeaderProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onClear: () => void;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  isMinimized,
  onMinimize,
  onClose,
  onClear,
}) => {
  return (
    <div className="oilia-chat-header">
      <div className="oilia-chat-header-info">
        <div className="oilia-chat-avatar">
          <FontAwesomeIcon icon={faLeaf} />
        </div>
        <div>
          <h3 id="oilia-chat-heading" className="oilia-chat-title">Tư vấn Oilia</h3>
          <p className="oilia-chat-status">Trợ lý tinh dầu & phối hương</p>
        </div>
      </div>

      <div className="oilia-chat-header-actions">
        {!isMinimized && (
          <button
            type="button"
            className="oilia-chat-header-btn"
            title="Làm mới cuộc trò chuyện"
            aria-label="Làm mới cuộc trò chuyện"
            onClick={onClear}
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
        )}

        <button
          type="button"
          className="oilia-chat-header-btn"
          title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
          aria-label={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
          aria-expanded={!isMinimized}
          onClick={onMinimize}
        >
          <FontAwesomeIcon icon={isMinimized ? faChevronUp : faMinus} />
        </button>

        <button
          type="button"
          className="oilia-chat-header-btn"
          title="Đóng chat"
          aria-label="Đóng chat"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>
  );
};

