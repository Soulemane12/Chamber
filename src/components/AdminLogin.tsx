"use client";

import { useState } from "react";

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      onLogin(password);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 max-w-md mx-auto animate-scale-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter admin password"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Access restricted to authorized personnel only.</p>
      </div>
    </div>
  );
} 