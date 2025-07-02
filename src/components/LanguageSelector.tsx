import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Language } from '@/lib/translations';

interface LanguageSelectorProps {
  className?: string;
}

const languageOptions: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`relative ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all duration-300"
        aria-label="Select language"
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.flag} {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

export function MobileLanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex justify-center space-x-2 py-2">
      {languageOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setLanguage(option.value)}
          className={`px-2 py-1 rounded-md text-sm transition-all duration-300 ${
            language === option.value
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={`Switch to ${option.label}`}
        >
          <span className="mr-1">{option.flag}</span>
          <span className="sr-only">{option.label}</span>
        </button>
      ))}
    </div>
  );
} 