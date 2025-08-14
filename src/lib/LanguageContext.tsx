"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof translations.en) => string;
};

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key) => key as string,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get the language from localStorage if available
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['en', 'fr', 'es', 'zh', 'ja', 'it'].includes(savedLanguage)) {
        return savedLanguage;
      }
    }
    return defaultLanguage;
  });

  useEffect(() => {
    // Save language preference to localStorage when it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = language;
    }
  }, [language]);

  // Translation function
  const t = (key: keyof typeof translations.en): string => {
    const languageMap = translations[language] as Partial<typeof translations.en>;
    const translation = languageMap[key];
    return translation || translations.en[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 