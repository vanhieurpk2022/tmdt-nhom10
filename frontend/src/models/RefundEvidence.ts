
export class RefundEvidence {
  id?: number;
  fileUrl?: string;
  contentType?: string;
  size?: number;
  uploadedAt?: string;

  constructor(init?: Partial<RefundEvidence>) {
    Object.assign(this, init);
  }
}
