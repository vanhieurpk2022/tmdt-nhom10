import axios from 'axios';

export function registrationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Đăng ký chưa hoàn tất. Vui lòng thử lại.';
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'Yêu cầu đăng ký đang xử lý lâu. Bạn kiểm tra email xác thực trước khi thử lại.';
  }
  if (!error.response) return 'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
  const data: unknown = error.response.data;
  if (data && typeof data === 'object' && 'message' in data
    && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  return 'Đăng ký chưa hoàn tất. Vui lòng thử lại sau.';
}
