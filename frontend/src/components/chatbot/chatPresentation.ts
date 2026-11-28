import type { ChatProductItem } from './types';

// BE giữ câu trả lời đầy đủ cho lịch sử hội thoại. Trên giao diện, thông tin
// đã có trong thẻ sản phẩm được hiển thị một lần, kèm lý do chọn ngay trên thẻ.
export function chatPresentation(text: string, products: ChatProductItem[] = []) {
  const reasons: Record<string, string> = {};
  let content = text;
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const product of products) {
    const block = new RegExp(
      `(^|\\n\\n)• \\*\\*${escape(product.name)}\\*\\*\\nXưởng:[^\\n]*\\n`
      + `\\[Xem chi tiết\\]\\(/product-detail/${escape(String(product.id))}\\)`
      + '(?:\\nPhù hợp vì: ([^\\n]+))?(?=\\n\\n|$)',
    );
    content = content.replace(block, (_match, separator: string, reason?: string) => {
      if (reason) reasons[String(product.id)] = reason;
      return separator;
    });
  }
  return { text: content.replace(/\n{3,}/g, '\n\n').trim(), reasons };
}
