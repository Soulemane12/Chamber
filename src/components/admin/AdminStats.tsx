"use client";

import { useState, useEffect } from "react";

interface StatsData {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsData>({
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'summary'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const result = await response.json();
      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Error loading stats: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Bookings</h3>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
          {stats.totalBookings.toLocaleString()}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Revenue</h3>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
          {formatCurrency(stats.totalRevenue)}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Average Booking Value</h3>
        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
          {formatCurrency(stats.averageBookingValue)}
        </p>
      </div>
    </div>
  );
}