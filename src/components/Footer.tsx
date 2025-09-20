"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

interface FooterProps {
  showSocials?: boolean;
  className?: string;
}

export function Footer({ showSocials = true, className = "" }: FooterProps) {
  const { t } = useLanguage();
  
  return (
    <footer className={`bg-white dark:bg-gray-800 py-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image 
                src="/logo.png" 
                alt="Wellnex02 Logo" 
                width={60} 
                height={60} 
                className="h-15 w-15"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('companyDescription')}
            </p>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('subscribeTitle')}
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors">
                  {t('subscribe')}
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('email')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/oxygen-therapy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('oxygenTherapy')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('contactUs')}
            </h4>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">{t('mail')}</span> {t('email')}
              </p>

            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
} 