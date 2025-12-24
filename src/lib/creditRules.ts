import { CreditAllocationRule } from '@/types/credits';

export const CREDIT_ALLOCATION_RULES: Record<string, CreditAllocationRule> = {
  // Gray Matter Recovery packages
  'gray-matter-recovery-3mo': {
    serviceId: 'gray-matter-recovery-3mo',
    creditType: 'gray_matter',
    sessions: 12,
    expirationDays: 90,
  },
  'gray-matter-recovery-6mo': {
    serviceId: 'gray-matter-recovery-6mo',
    creditType: 'gray_matter',
    sessions: 16,
    expirationDays: 180,
  },
  'gray-matter-recovery-12mo': {
    serviceId: 'gray-matter-recovery-12mo',
    creditType: 'gray_matter',
    sessions: 48,
    expirationDays: 365,
  },

  // Optimal Wellness packages
  'optimal-wellness-3mo': {
    serviceId: 'optimal-wellness-3mo',
    creditType: 'optimal_wellness',
    sessions: 12,
    expirationDays: 90,
  },
  'optimal-wellness-6mo': {
    serviceId: 'optimal-wellness-6mo',
    creditType: 'optimal_wellness',
    sessions: 24,
    expirationDays: 180,
  },
  'optimal-wellness-12mo': {
    serviceId: 'optimal-wellness-12mo',
    creditType: 'optimal_wellness',
    sessions: 48,
    expirationDays: 365,
  },

  // Revitalize Wellness packages
  'revitalize-wellness-3mo': {
    serviceId: 'revitalize-wellness-3mo',
    creditType: 'optimal_wellness',
    sessions: 12,
    expirationDays: 90,
  },
  'revitalize-wellness-6mo': {
    serviceId: 'revitalize-wellness-6mo',
    creditType: 'optimal_wellness',
    sessions: 24,
    expirationDays: 180,
  },
  'revitalize-wellness-12mo': {
    serviceId: 'revitalize-wellness-12mo',
    creditType: 'optimal_wellness',
    sessions: 48,
    expirationDays: 365,
  },

  // Morris 12-week challenge
  'morris-12-week': {
    serviceId: 'morris-12-week',
    creditType: 'challenge',
    sessions: 12,
    expirationDays: 84, // 12 weeks
  },
};

export function getCreditAllocationRule(serviceId: string): CreditAllocationRule | null {
  return CREDIT_ALLOCATION_RULES[serviceId] || null;
}

export function calculateExpirationDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
