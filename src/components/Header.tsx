import Link from "next/link";
import { LanguageSelector, MobileLanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/LanguageContext";

interface HeaderProps {
  currentPage?: 'home' | 'booking' | 'about' | 'contact' | 'admin' | 'account';
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  const { t } = useLanguage();

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
                href="/contact" 
                className={currentPage === 'contact' 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"}
              >
                {t('contact')}
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