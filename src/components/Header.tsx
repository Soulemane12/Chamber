"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LanguageSelector, MobileLanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/LanguageContext";
import { supabase } from "@/lib/supabaseClient";

interface HeaderProps {
  currentPage?: 'home' | 'booking' | 'admin' | 'account';
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
      <div className="flex items-center mb-4 sm:mb-0">
        <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Chamber
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
        <nav className="w-full sm:w-auto mb-4 sm:mb-0">
          <ul className="flex flex-wrap justify-center sm:space-x-8">
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/" 
                className={currentPage === 'home' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('home')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href={isAuthenticated ? "/booking" : "/login?redirect=/booking"} 
                className={currentPage === 'booking' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('bookNow')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href={isAuthenticated ? "/account" : "/login?redirect=/account"} 
                className={currentPage === 'account' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                Account
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden sm:block ml-6">
          <LanguageSelector />
        </div>
      </div>
      <div className="sm:hidden w-full mt-2">
        <MobileLanguageSelector />
      </div>
    </header>
  );
} 