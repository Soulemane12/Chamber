"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CreditPackage } from '@/types/credits';
import { format, differenceInDays, isPast } from 'date-fns';

interface CreditsDisplayProps {
  userId: string;
}

export function CreditsDisplay({ userId }: CreditsDisplayProps) {
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCredits() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const credits = (user.user_metadata?.credits as CreditPackage[]) || [];
        setCreditPackages(credits);
      } catch (error) {
        console.error('Error loading credits:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCredits();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (creditPackages.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Packages
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No active packages. Purchase a package to see your credits here.
        </p>
      </div>
    );
  }

  const now = new Date();
  const activePackages = creditPackages.filter(pkg => {
    if (!pkg.expiresAt) return pkg.balance > 0;
    return !isPast(new Date(pkg.expiresAt)) && pkg.balance > 0;
  });

  const expiredPackages = creditPackages.filter(pkg => {
    if (!pkg.expiresAt) return false;
    return isPast(new Date(pkg.expiresAt));
  });

  const getStatusBadge = (pkg: CreditPackage) => {
    if (!pkg.expiresAt) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          No Expiration
        </span>
      );
    }

    const daysUntilExpiration = differenceInDays(new Date(pkg.expiresAt), now);

    if (daysUntilExpiration < 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          Expired
        </span>
      );
    } else if (daysUntilExpiration <= 7) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          Expires in {daysUntilExpiration} days
        </span>
      );
    } else if (daysUntilExpiration <= 30) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Expires in {daysUntilExpiration} days
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Active
        </span>
      );
    }
  };

  const formatCreditType = (type: string): string => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Active Packages */}
      {activePackages.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Packages
          </h2>
          <div className="space-y-4">
            {activePackages.map((pkg, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {pkg.packageName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCreditType(pkg.type)}
                    </p>
                  </div>
                  {getStatusBadge(pkg)}
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Sessions Remaining</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {pkg.balance} / {pkg.originalBalance || pkg.balance}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(pkg.balance / (pkg.originalBalance || pkg.balance)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {pkg.expiresAt && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Expires: {format(new Date(pkg.expiresAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                {pkg.purchasedAt && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Purchased: {format(new Date(pkg.purchasedAt), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired Packages */}
      {expiredPackages.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expired Packages
          </h2>
          <div className="space-y-3">
            {expiredPackages.map((pkg, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 opacity-60"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      {pkg.packageName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Expired: {pkg.expiresAt && format(new Date(pkg.expiresAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Expired
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
