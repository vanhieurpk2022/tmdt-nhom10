export const FactoryStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
} as const;

export type FactoryStatus = (typeof FactoryStatus)[keyof typeof FactoryStatus];