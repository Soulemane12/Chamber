"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LanguageSelector, MobileLanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/LanguageContext";

interface HeaderProps {
  currentPage?: 'home' | 'about' | 'contact' | 'oxygenTherapy' | 'products' | 'faq';
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  const { t } = useLanguage();
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);

  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center relative">
      <div className="flex items-center mb-4 sm:mb-0">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Wellnex02 Logo"
            width={140}
            height={140}
            className="h-32 w-32 sm:h-36 sm:w-36"
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
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-blue-400"}
              >
                {t('home')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/about" 
                className={currentPage === 'about' 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-blue-400"}
              >
                {t('about')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/oxygen-therapy" 
                className={currentPage === 'oxygenTherapy' 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-blue-400"}
              >
                {t('oxygenTherapy')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0 relative"
                onMouseEnter={() => setIsProductsDropdownOpen(true)}
                onMouseLeave={() => setIsProductsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                className={`flex items-center justify-center space-x-1 w-full sm:w-auto text-center ${
                  currentPage === 'products'
                    ? "text-blue-400 font-medium"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                <span>{t('products')}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`dropdown-menu absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 transition-all duration-200 ${
                  isProductsDropdownOpen ? 'block opacity-100 visible translate-y-0' : 'hidden opacity-0 invisible -translate-y-2'
                }`}
              >
                <div className="py-2">
                  <Link 
                    href="/products" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    All Products
                  </Link>
                  <Link 
                    href="/products/o2-box-t2r" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    O2 BOX T2-R (1-2 Persons)
                  </Link>
                  <Link 
                    href="/products/o2-box-t68r" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    O2 BOX T68-R (6-8 Persons)
                  </Link>
                  <Link 
                    href="/products/o2-box-t810r-w2000" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    O2 BOX T810-R W2000 (8-10 Persons)
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <Link 
                    href="/products/operational-items" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Operational Items
                  </Link>
                </div>
              </div>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/faq" 
                className={currentPage === 'faq' 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-blue-400"}
              >
                {t('faq')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/contact" 
                className={currentPage === 'contact' 
                  ? "text-blue-400 font-medium" 
                  : "text-gray-300 hover:text-blue-400"}
              >
                {t('contact')}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden sm:flex items-center ml-6 space-x-4">
          <LanguageSelector />
        </div>
      </div>
      <div className="sm:hidden w-full mt-2 flex flex-col items-center">
        <MobileLanguageSelector />
      </div>
    </header>
  );
} 