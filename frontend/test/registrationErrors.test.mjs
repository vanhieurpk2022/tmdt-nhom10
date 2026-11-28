import test from 'node:test';
import assert from 'node:assert/strict';
import { registrationErrorMessage } from '../src/pages/registrationErrors.ts';

test('distinguishes a request timeout from a disconnected server', () => {
  const timeout = registrationErrorMessage({ isAxiosError: true, code: 'ECONNABORTED' });
  assert.match(timeout, /xử lý lâu/);
  assert.match(timeout, /kiểm tra email/);
  assert.doesNotMatch(timeout, /Không kết nối/);
  assert.match(registrationErrorMessage({ isAxiosError: true, code: 'ERR_NETWORK' }), /Không kết nối/);
});

test('preserves the backend business error instead of misreporting a network failure', () => {
  const message = 'Tạm thời chưa gửi được email xác thực. Vui lòng thử lại sau';
  assert.equal(message, registrationErrorMessage({ isAxiosError: true, response: { status: 503, data: { message } } }));
  assert.equal('Email đã tồn tại', registrationErrorMessage({ isAxiosError: true, response: { status: 409, data: { message: 'Email đã tồn tại' } } }));
});

test('handles missing or malformed error responses without rendering an empty message', () => {
  for (const error of [new Error('internal details'), { isAxiosError: true, response: { data: '<html>Bad Gateway</html>' } },
    { isAxiosError: true, response: { data: { message: {} } } }]) {
    const message = registrationErrorMessage(error);
    assert.ok(message.length > 15);
    assert.doesNotMatch(message, /internal details|<html>/);
  }
});
