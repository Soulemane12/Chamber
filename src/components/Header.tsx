"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSelector, MobileLanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/LanguageContext";

interface HeaderProps {
  currentPage?: 'home' | 'about' | 'oxygenTherapy' | 'products' | 'faq' | 'contact';
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
      <div className="flex items-center mb-4 sm:mb-0">
        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="sr-only">Home</span>
          <Image 
            src="/logo.png" 
            alt="Wellnex02 Logo" 
            width={48} 
            height={48} 
            className="h-12 w-12"
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
                href="/about" 
                className={currentPage === 'about' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('about')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/oxygen-therapy" 
                className={currentPage === 'oxygenTherapy' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('oxygenTherapy')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/products" 
                className={currentPage === 'products' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('products')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/faq" 
                className={currentPage === 'faq' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('faq')}
              </Link>
            </li>
            <li className="px-3 py-2 sm:p-0">
              <Link 
                href="/contact" 
                className={currentPage === 'contact' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('contact')}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden sm:flex items-center ml-6 space-x-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Wellnex02
          </div>
          <LanguageSelector />
        </div>
      </div>
      <div className="sm:hidden w-full mt-2 flex flex-col items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
          Wellnex02
        </div>
        <MobileLanguageSelector />
      </div>
    </header>
  );
} 