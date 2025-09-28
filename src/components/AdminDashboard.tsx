"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Dashboard Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Admin dashboard functionality will be implemented here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Bookings</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">This Month</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">0</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">$0</p>
        </div>
      </div>
    </div>
  );
}