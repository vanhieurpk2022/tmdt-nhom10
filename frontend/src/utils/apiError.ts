import { isAxiosError } from 'axios';

export interface ApiError extends Error {
  response?: { status?: number; data?: { message?: string; code?: number; error?: string } };
}

export function toApiError(error: unknown): ApiError {
  if (isAxiosError<{ message?: string; code?: number; error?: string }>(error)) return error;
  return error instanceof Error ? error : new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
}
