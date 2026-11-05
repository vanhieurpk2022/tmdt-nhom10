import type { RefundStatus } from '../enums/RefundStatus';
import type { RefundEvidence } from './RefundEvidence';

export class Refund {
  id?: number;
  reason?: string;
  status?: RefundStatus;
  amountVnd?: number;
  paymentAttemptId?: number;
  requestKey?: string;
  requestedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  providerRequestId?: string;
  providerRequestedAt?: string;
  providerResponseId?: string;
  providerTransactionNo?: string;
  providerResponseCode?: string;
  providerTransactionStatus?: string;
  processedBy?: string;
  lastError?: string;
  legacyStatus?: string;
  version?: number;
  createdAt?: string;
  processedAt?: string;
  refundEvidenceList?: RefundEvidence[];

  constructor(init?: Partial<Refund>) {
    Object.assign(this, init);
  }
}
