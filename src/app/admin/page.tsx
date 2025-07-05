"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLogin from "@/components/AdminLogin";
import AdminNav from "@/components/AdminNav";
import UsersSection from "@/components/UsersSection";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');

  // Check if user is already authenticated (using localStorage)
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("adminAuthenticated");
      if (authStatus === "true") {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (password: string) => {
    // Simple password check - in a real app, use a secure authentication method
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("adminAuthenticated", "true");
      setIsAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-blue-600 dark:text-blue-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="admin" />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your application and view analytics
            </p>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors self-start sm:self-center"
            >
              Logout
            </button>
          )}
        </div>

        {isAuthenticated ? (
          <div className="animate-fade-in">
            <AdminNav 
              activeTab={activeTab} 
              onTabChange={(tab) => setActiveTab(tab)} 
            />
            
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'users' && <UsersSection />}
          </div>
        ) : (
          <AdminLogin onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
} 