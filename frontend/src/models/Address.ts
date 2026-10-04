
export class Address {
  id?: number;
  /** Giữ nguyên chính tả "recipentName" như bên Java */
  recipentName?: string;
  phoneNumber?: string;
  street?: string;
  ward?: string;
  city?: string;
  /**
   * Java: `boolean isDefault` + Lombok => getter isDefault(),
   * Jackson serialize thành "default".
   */
  default: boolean = false;


  constructor(init?: Partial<Address>) {
    Object.assign(this, init);
  }
}
