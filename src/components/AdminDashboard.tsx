"use client";

import { useState } from "react";
import AdminStats from "./admin/AdminStats";
import ChatBot from "./admin/ChatBot";
import BookingsTable from "./admin/BookingsTable";
import UsersList from "./admin/UsersList";

type TabType = 'overview' | 'bookings' | 'users' | 'chat';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: '📊' },
    { id: 'bookings' as TabType, name: 'Bookings', icon: '📅' },
    { id: 'users' as TabType, name: 'Users', icon: '👥' },
    { id: 'chat' as TabType, name: 'AI Assistant', icon: '🤖' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Dashboard Overview
              </h2>
              <AdminStats />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Bookings
              </h3>
              <BookingsTable />
            </div>
          </div>
        );
      case 'bookings':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Bookings Management
            </h2>
            <BookingsTable />
          </div>
        );
      case 'users':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Users Management
            </h2>
            <UsersList />
          </div>
        );
      case 'chat':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              AI Assistant
            </h2>
            <div className="max-w-4xl mx-auto">
              <ChatBot />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>
    </div>
  );
}