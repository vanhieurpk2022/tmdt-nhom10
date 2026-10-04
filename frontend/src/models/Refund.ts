import type { OrderStatus } from '../enums/OrderStatus';
import type { RefundEvidence } from './RefundEvidence';

export class Refund {
  id?: number;
  reason?: string;
  status?: OrderStatus;
  amount?: number;
  createdAt?: string;
  processedAt?: string;
  refundEvidenceList?: RefundEvidence[];

  constructor(init?: Partial<Refund>) {
    Object.assign(this, init);
  }
}
