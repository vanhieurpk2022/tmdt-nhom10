export const ProductType = {
  NORMAL: 'NORMAL',
  CUSTOM: 'CUSTOM',
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];