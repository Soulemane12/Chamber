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
    <header className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
      <div className="flex items-center mb-3 sm:mb-0">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <span className="sr-only">Home</span>
          <Image
            src="/logo.png"
            alt="WellNex02 Logo"
            width={200}
            height={200}
            className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32"
            priority
          />
          <Image
            src="/midtown_logo.png"
            alt="Midtown Biohack Logo"
            width={200}
            height={200}
            className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32"
            priority
          />
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3 sm:gap-0">
        <nav className="w-full sm:w-auto">
          <ul className="flex flex-wrap justify-center sm:space-x-8 gap-1 sm:gap-0">
            <li className="px-2 sm:px-0 py-1 sm:py-0">
              <Link
                href="/"
                className={`text-sm sm:text-base ${currentPage === 'home'
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}`}
              >
                {t('home')}
              </Link>
            </li>
            <li className="px-2 sm:px-0 py-1 sm:py-0">
              <Link
                href="/booking"
                className={`text-sm sm:text-base ${currentPage === 'booking'
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}`}
              >
                {t('bookNow')}
              </Link>
            </li>
            <li className="px-2 sm:px-0 py-1 sm:py-0">
              <Link
                href={isAuthenticated ? "/account" : "/login?redirect=/account"}
                className={`text-sm sm:text-base ${currentPage === 'account'
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}`}
              >
                Account
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden sm:flex items-center ml-4 lg:ml-6 space-x-4">
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            WellNex02
          </div>
          <LanguageSelector />
        </div>
      </div>
      <div className="sm:hidden w-full flex flex-col items-center gap-2">
        <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          WellNex02
        </div>
        <MobileLanguageSelector />
      </div>
    </header>
  );
} 