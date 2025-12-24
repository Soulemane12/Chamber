import { CreditPackage } from '@/types/credits';

export function migrateLegacyCredits(credits: any[]): CreditPackage[] {
  return credits.map(credit => {
    // Check if already in new format
    if ('packageName' in credit && 'expiresAt' in credit) {
      return credit as CreditPackage;
    }

    // Legacy format - convert
    return {
      type: credit.type,
      balance: credit.balance,
      expiresAt: null, // No expiration for legacy credits
      packageName: `Legacy ${credit.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Credits`,
      purchasedAt: undefined,
      originalBalance: credit.balance,
    };
  });
}
