import type { Factory } from './Factory';

export class FactoryImage {
  id?: number;
  imageUrl?: string;
  /** Java `isAvatar` => Jackson serialize thành "avatar" */
  avatar: boolean = false;
  /** Java `isBanner` => Jackson serialize thành "banner" */
  banner: boolean = false;

  constructor(init?: Partial<FactoryImage>) {
    Object.assign(this, init);
  }
}
