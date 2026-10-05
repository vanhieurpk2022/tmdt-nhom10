export class FactoryImage {
  id?: number;
  imageUrl?: string;
  /** Java `isAvatar` serialize thành "avatar". */
  avatar: boolean = false;
  /** Java `isBanner` serialize thành "banner". */
  banner: boolean = false;

  constructor(init?: Partial<FactoryImage>) {
    Object.assign(this, init);
  }
}
