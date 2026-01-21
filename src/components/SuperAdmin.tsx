"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SiteSettings {
  landingPageTitle?: string;
  landingPageSubtitle?: string;
  landingPageDescription?: string;
  bookingPageTitle?: string;
  bookingPageSubtitle?: string;
}

interface UserCredit {
  userId: string;
  userName: string;
  email: string;
  creditType: string;
  amount: number;
}

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<'settings' | 'credits'>('settings');
  const [settings, setSettings] = useState<SiteSettings>({
    landingPageTitle: "Welcome to Midtown Biohack™",
    landingPageSubtitle: "New York's private human performance and recovery Lab",
    landingPageDescription: "This is your access point to our concierge service designed specifically for you to help recover faster, perform better and live with greater clarity and energy",
    bookingPageTitle: "Choose Your Recovery Options",
    bookingPageSubtitle: "Choose the package that best fits you"
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Credit management
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [creditType, setCreditType] = useState<'gray_matter' | 'optimal_wellness' | 'challenge' | 'hbot'>('gray_matter');
  const [creditAmount, setCreditAmount] = useState<number>(1);
  const [expirationDays, setExpirationDays] = useState<number>(90);
  const [creditNotes, setCreditNotes] = useState<string>('');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('superAdminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    setSaving(true);
    try {
      localStorage.setItem('superAdminSettings', JSON.stringify(settings));
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const giveCredits = async () => {
    if (!customerEmail || creditAmount <= 0) {
      setMessage({ text: 'Please enter a customer email and valid credit amount', type: 'error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    try {
      setSaving(true);

      // Look up user by email using admin API
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        setMessage({ text: 'Error looking up user', type: 'error' });
        return;
      }

      const user = usersData.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());

      if (!user) {
        setMessage({ text: `No account found for email: ${customerEmail}`, type: 'error' });
        return;
      }

      // Calculate expiration date
      const expiresAt = expirationDays > 0
        ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Create new credit package
      const newCreditPackage = {
        type: creditType,
        balance: creditAmount,
        expiresAt,
        packageName: `Admin Grant - ${creditType}`,
        purchasedAt: new Date().toISOString(),
        originalBalance: creditAmount,
        notes: creditNotes || 'Granted by admin'
      };

      // Get existing credits
      const existingCredits = (user.user_metadata?.credits as any[]) || [];
      const updatedCredits = [...existingCredits, newCreditPackage];

      // Update user metadata
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          credits: updatedCredits,
        }
      });

      setMessage({ text: `Successfully granted ${creditAmount} ${creditType} credits to ${customerEmail}!`, type: 'success' });

      // Reset form
      setCustomerEmail('');
      setCreditAmount(1);
      setCreditNotes('');

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error granting credits:', error);
      setMessage({ text: 'Failed to grant credits', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Super Admin Panel</h2>
        <p className="text-purple-100">Manage site settings and client credits</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border-l-4 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Site Text Settings
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'credits'
              ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('credits')}
        >
          Give Credits
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Landing Page Text</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Main Title
                </label>
                <input
                  type="text"
                  value={settings.landingPageTitle}
                  onChange={(e) => setSettings({...settings, landingPageTitle: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle (Columbia Blue text)
                </label>
                <input
                  type="text"
                  value={settings.landingPageSubtitle}
                  onChange={(e) => setSettings({...settings, landingPageSubtitle: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.landingPageDescription}
                  onChange={(e) => setSettings({...settings, landingPageDescription: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Page Text</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking Page Title
                </label>
                <input
                  type="text"
                  value={settings.bookingPageTitle}
                  onChange={(e) => setSettings({...settings, bookingPageTitle: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking Page Subtitle
                </label>
                <input
                  type="text"
                  value={settings.bookingPageSubtitle}
                  onChange={(e) => setSettings({...settings, bookingPageSubtitle: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Changes are saved locally in your browser. To apply these changes site-wide,
              you'll need to update the actual component files or implement a database-backed settings system.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grant Credits to Client</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer's email address"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credit Type
                  </label>
                  <select
                    value={creditType}
                    onChange={(e) => setCreditType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="gray_matter">Gray Matter</option>
                    <option value="optimal_wellness">Optimal Wellness</option>
                    <option value="challenge">Challenge</option>
                    <option value="hbot">HBOT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiration (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0 = No expiration"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave as 0 for credits that never expire
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  placeholder="e.g., Promotional offer, customer compensation"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={giveCredits}
              disabled={saving || !customerEmail}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Granting Credits...' : 'Grant Credits'}
            </button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>💡 Tip:</strong> Credits will be immediately available to the client.
              They can use them when booking services that match the credit type.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
