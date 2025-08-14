"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="contact" />
      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('contactUs')}</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <form className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">{t('name')}</span>
              <input type="text" className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2" placeholder="Jane Doe" />
            </label>
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">{t('email')}</span>
              <input type="email" className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">{t('phone')}</span>
              <input type="tel" className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2" placeholder="+1 (555) 000-0000" />
            </label>
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">Message</span>
              <textarea rows={5} className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2" placeholder="Tell us what you need..." />
            </label>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium w-full sm:w-auto">Send</button>
          </form>
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>Email: billydduc@gmail.com</p>
            <p>Phone: +1 (646) 262-8794</p>
          </div>
        </div>
      </main>
      <Footer className="mt-10" />
    </div>
  );
}


