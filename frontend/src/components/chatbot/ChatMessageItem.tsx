import React from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { ChatMessage } from './types';
import { chatPresentation } from './chatPresentation';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
}) => {
  const isBot = message.sender === 'bot';
  const presentation = isBot ? chatPresentation(message.text, message.products) : { text: message.text, reasons: {} as Record<string, string> };

  // Format timestamp (e.g., 14:32)
  const formatTime = (time: Date | string) => {
    try {
      const d = typeof time === 'string' ? new Date(time) : time;
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Render thẻ Link / a có thể click được
  const renderLinkItem = (rawUrl: string, rawLabel: string, key: number) => {
    const cleanUrl = rawUrl.trim();

    // Bỏ qua các URL lỗi do model sinh nhầm (chứa chữ 'nguồn:' hoặc 'product_')
    if (cleanUrl.includes('nguồn:') || cleanUrl.includes('ngu%E1%BB%93n') || !/^(\/[^/]|https?:\/\/)/i.test(cleanUrl)) {
      return <strong key={key}>{rawLabel}</strong>;
    }

    const isInternal =
      cleanUrl.startsWith('/') ||
      cleanUrl.includes('localhost:5173') ||
      (typeof window !== 'undefined' && cleanUrl.includes(window.location.host));

    const targetUrl = cleanUrl.replace(/^https?:\/\/[^/]+/, '');

    // Xác định nhãn hiển thị cho đường dẫn
    let label = rawLabel.trim();
    if (!label || label === cleanUrl || label.toLowerCase() === 'a' || label.toLowerCase() === 'link') {
      if (cleanUrl.includes('/product-detail/')) {
        label = 'Bấm đường dẫn để xem';
      } else {
        label = 'Xem liên kết';
      }
    }

    if (isInternal) {
      return (
        <Link
          key={key}
          to={targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}
          className="oilia-chat-clickable-link"
        >
          {label}
        </Link>
      );
    }

    return (
      <a
        key={key}
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="oilia-chat-clickable-link"
      >
        {label}
      </a>
    );
  };

  // Helper to format text with markdown (bold, images, links, HTML <a> tags, raw URLs, line breaks)
  const renderFormattedText = (content: string) => {
    // Làm sạch nội dung trước khi render
    const cleanContent = content
      .replace(/\[([^\]]+)\]\([^)]*(?:nguồn|product_)[^)]*\)/gi, '**$1**')
      .replace(/\(?nguồn:\s*product_\d+\)?/gi, '')
      .replace(/\[Xem\s+(?:chi\s+tiết\s+)?sản\s+phẩm\]\((https?:\/\/[^\s)]+)\)/gi, '[Bấm đường dẫn để xem]($1)');

    const lines = cleanContent.split('\n');

    // Chú ý: regex dùng trong split BẮT BUỘC chỉ có DUY NHẤT 1 outer group, TẤT CẢ group con phải là (?:...)
    // để tránh JavaScript split tạo ra các phần tử thừa gây lặp chữ / lặp nút!
    const tokenRegex = /(\*\*.*?\*\*|!\[[^\]]*?\]\([^)]*?\)|<a\s+[^>]*?href=["'][^"']*["'][^>]*>.*?<\/a>|\[[^\]]*?\]\([^)]*?\)|https?:\/\/[^\s<>)]+)/gi;

    return lines.map((line, lIdx) => {
      const parts = line.split(tokenRegex).filter((p) => p !== undefined && p !== '');

      return (
        <span key={lIdx} style={{ display: 'block', minHeight: line ? undefined : '8px' }}>
          {parts.map((part, pIdx) => {
            // 1. Bold text: **text**
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
            }

            // 2. Markdown Image: ![alt](url)
            const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
              const [, alt, src] = imgMatch;
              return (
                <span key={pIdx} style={{ display: 'block', margin: '6px 0', textAlign: 'center' }}>
                  <img
                    src={src}
                    alt={alt || 'Hình ảnh sản phẩm'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '160px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                    }}
                  />
                </span>
              );
            }

            // 3. Markdown link [text](url)
            const mdMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
            if (mdMatch) {
              const [, rawLabel, rawUrl] = mdMatch;
              return renderLinkItem(rawUrl, rawLabel, pIdx);
            }

            // 4. HTML <a> tag
            const htmlMatch = part.match(/^<a\s+[^>]*?href=["']([^"']*)["'][^>]*>(.*?)<\/a>$/i);
            if (htmlMatch) {
              const [, rawUrl, rawLabel] = htmlMatch;
              return renderLinkItem(rawUrl, rawLabel, pIdx);
            }

            // 5. Raw URL
            if (/^https?:\/\//i.test(part)) {
              return renderLinkItem(part, '', pIdx);
            }

            return <React.Fragment key={pIdx}>{part}</React.Fragment>;
          })}
        </span>
      );
    });
  };

  return (
    <div
      className={`oilia-chat-msg-row ${isBot ? 'bot' : 'user'}`}
      aria-label={isBot ? 'Trợ lý Oilia' : 'Bạn'}
    >
      <div className="oilia-chat-msg-content-wrap">
        <div className="oilia-chat-msg-bubble">
          {presentation.text && renderFormattedText(presentation.text)}

          {/* Product recommendations with real images & prices */}
          {message.products && message.products.length > 0 && (
            <div className="oilia-chat-products-grid">
              {message.products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product-detail/${product.id}`}
                  className="oilia-chat-product-card"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="oilia-chat-product-img"
                    />
                  ) : (
                    <div
                      className="oilia-chat-product-img d-flex align-items-center justify-content-center text-muted"
                    >
                      <FontAwesomeIcon icon={faBagShopping} />
                    </div>
                  )}

                  <div className="oilia-chat-product-info">
                    <p className="oilia-chat-product-title">{product.name}</p>
                    <small>{product.factoryName}{product.volumeMl ? ` · ${product.volumeMl}ml` : ''}</small>
                    <p className="oilia-chat-product-price">
                      {product.price.toLocaleString('vi-VN')}₫
                      {product.originalPrice && (
                        <span className="oilia-chat-product-old-price">
                          {product.originalPrice.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </p>
                    {presentation.reasons[String(product.id)] && (
                      <small className="oilia-chat-product-reason">{presentation.reasons[String(product.id)]}</small>
                    )}
                  </div>

                  <span className="oilia-chat-product-btn" aria-hidden="true">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <span className="oilia-chat-msg-time">
          {isBot && 'Oilia · '}{formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};
