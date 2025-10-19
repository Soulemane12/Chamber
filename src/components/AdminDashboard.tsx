"use client";

import { useState } from "react";
import AdminStats from "./admin/AdminStats";
import ChatBot from "./admin/ChatBot";
import BookingsTable from "./admin/BookingsTable";
import UsersList from "./admin/UsersList";

// StatCard component for summary statistics
function StatCard({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

type TabType = 'overview' | 'bookings' | 'users' | 'chat';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: '📊' },
    { id: 'bookings' as TabType, name: 'Bookings', icon: '📅' },
    { id: 'users' as TabType, name: 'Users', icon: '👥' },
    { id: 'chat' as TabType, name: 'AI Assistant', icon: '🤖' },
  ];


  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Bookings"
          value="N/A"
          subtitle="All time"
        />
        <StatCard
          title="Average Booking Value"
          value="N/A"
          subtitle="Last updated: N/A"
        />
        <StatCard
          title="Users"
          value="N/A"
          subtitle="Total registered users"
        />
        <StatCard
          title="Active Sessions"
          value="0"
          subtitle="Currently running"
        />
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden mb-6">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 pb-4">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 w-full md:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-2 px-4 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Dashboard Overview
            </h2>
            <AdminStats />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Bookings
            </h3>
            <BookingsTable />
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bookings Management
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <BookingsTable />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Users Management
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <UsersList />
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Assistant
            </h2>
          </div>
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <ChatBot />
          </div>
        </div>
      )}
    </div>
  );
}