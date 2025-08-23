"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSelector, MobileLanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/LanguageContext";

interface HeaderProps {
  currentPage?: 'home' | 'booking' | 'admin' | 'account' | 'about' | 'contact' | 'oxygenTherapy' | 'products' | 'faq';
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
      <div className="flex items-center mb-4 sm:mb-0">
        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="sr-only">Home</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
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
                Book Now
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/account" 
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
      
      {/* Large ATMOS Logo on the right */}
      <div className="absolute top-4 right-4 sm:right-8 lg:right-12">
        <Image 
          src="/atmos_logo.jpg" 
          alt="ATMOS Logo" 
          width={120}
          height={80}
          className="h-20 w-auto object-contain"
          priority
        />
      </div>
    </header>
  );
} 