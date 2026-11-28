import assert from 'node:assert/strict';
import test from 'node:test';
import { readChatEvents, validateChatResponse } from '../src/api/chatbotStream.ts';

const encode = new TextEncoder();

function responseFor(text, chunkSize = 3) {
  const bytes = encode.encode(text);
  return new Response(new ReadableStream({
    start(controller) {
      for (let offset = 0; offset < bytes.length; offset += chunkSize) controller.enqueue(bytes.slice(offset, offset + chunkSize));
      controller.close();
    },
  }));
}

test('reads UTF-8 and JSON lines split at arbitrary network boundaries', async () => {
  const phases = [];
  const response = responseFor([
    { type: 'status', phase: 'searching' },
    { type: 'ping' },
    { type: 'status', phase: 'writing' },
    { type: 'result', reply: 'Tinh dầu Bạc Hà', products: [{ id: 1, name: 'Bạc Hà', price: 370000, imageUrl: null }] },
  ].map(event => JSON.stringify(event)).join('\n'));
  const result = await readChatEvents(response, phase => phases.push(phase));
  assert.equal(result.reply, 'Tinh dầu Bạc Hà');
  assert.equal(result.products[0].price, 370000);
  assert.deepEqual(phases, ['searching', 'writing']);
});

test('rejects an interrupted response that has no final result', async () => {
  await assert.rejects(readChatEvents(responseFor('{"type":"status","phase":"writing"}\n')), /bị ngắt/);
});

test('surfaces explicit server errors instead of rendering an empty answer', async () => {
  await assert.rejects(readChatEvents(responseFor('{"type":"error","detail":"Thử lại sau nhé"}\n')), /Thử lại sau/);
});

test('abort cancels the stream even while waiting for the next network chunk', async () => {
  let cancelled = false;
  const controller = new AbortController();
  const response = new Response(new ReadableStream({
    pull() { return new Promise(() => {}); },
    cancel() { cancelled = true; },
  }));
  const pending = readChatEvents(response, undefined, controller.signal);
  controller.abort();
  await assert.rejects(pending, error => error.name === 'AbortError');
  assert.equal(cancelled, true);
});

test('ignores unknown phase names, including inherited object properties', async () => {
  const phases = [];
  const text = '{"type":"status","phase":"__proto__"}\n{"type":"result","reply":"OK","products":[]}\n';
  await readChatEvents(responseFor(text), phase => phases.push(phase));
  assert.deepEqual(phases, []);
});

test('rejects malformed product data and oversized result arrays', () => {
  assert.throws(() => validateChatResponse({ reply: 'OK', products: [{ id: 1, name: 'Bạc Hà', price: 'fake' }] }), /không hợp lệ/);
  assert.throws(() => validateChatResponse({ reply: 'OK', products: Array(13).fill({ id: 1, name: 'Bạc Hà', price: 1 }) }), /không hợp lệ/);
});
