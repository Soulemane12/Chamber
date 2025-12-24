export interface CreditPackage {
  type: string;              // 'gray_matter' | 'optimal_wellness' | 'challenge' | 'hbot'
  balance: number;           // Remaining sessions
  expiresAt: string | null;  // ISO date string or null for no expiration
  packageName: string;       // Human-readable package name
  purchasedAt?: string;      // ISO date string when purchased
  originalBalance?: number;  // Original session count
}

export type CreditType = 'gray_matter' | 'optimal_wellness' | 'challenge' | 'hbot';

export interface CreditAllocationRule {
  serviceId: string;
  creditType: CreditType;
  sessions: number;
  expirationDays: number;
}
