"use client";

import Link from "next/link";
import Image from "next/image";
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
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <span className="sr-only">Home</span>
          <Image 
            src="/logo.png" 
            alt="WellNex02 Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8"
            priority
          />
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
                href="/booking" 
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
        <div className="hidden sm:flex items-center ml-6 space-x-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            WellNex02
          </div>
          <LanguageSelector />
        </div>
      </div>
      <div className="sm:hidden w-full mt-2 flex flex-col items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
          WellNex02
        </div>
        <MobileLanguageSelector />
      </div>
    </header>
  );
} 