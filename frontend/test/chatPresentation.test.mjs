import test from 'node:test';
import assert from 'node:assert/strict';
import { chatPresentation } from '../src/components/chatbot/chatPresentation.ts';

const products = [{ id: 1, name: 'Bạc Hà (Peppermint)', price: 370000 }];

test('shows product facts once and keeps the introduction, reason and browse link', () => {
  const text = 'Bạn có thể cân nhắc lựa chọn này.\n\n• **Bạc Hà (Peppermint)**\nXưởng: Labcos · 10ml · 370.000đ · Còn hàng\n[Xem chi tiết](/product-detail/1)\nPhù hợp vì: Đúng mùi bạn chọn.\n\n[Xem thêm](/products)';
  assert.deepEqual(chatPresentation(text, products), {
    text: 'Bạn có thể cân nhắc lựa chọn này.\n\n[Xem thêm](/products)',
    reasons: { 1: 'Đúng mùi bạn chọn.' },
  });
});

test('preserves facts when the corresponding card is absent or has a different ID', () => {
  const text = '• **Bạc Hà (Peppermint)**\nXưởng: Labcos · 10ml · 370.000đ\n[Xem chi tiết](/product-detail/2)';
  assert.equal(text, chatPresentation(text, products).text);
  assert.equal(text, chatPresentation(text).text);
});

test('never removes custom advice or stock details', () => {
  const text = 'Bạc hà 10ml còn 40 chai.\n\nBạn muốn xem dung tích khác không?';
  assert.equal(text, chatPresentation(text, products).text);
});
