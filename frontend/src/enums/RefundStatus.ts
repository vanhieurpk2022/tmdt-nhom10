export const RefundStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
} as const;

export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];
