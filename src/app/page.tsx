"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="home" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            {t('heroTitle')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            {t('heroSubtitle')}
          </p>
          <div className="mt-10 animate-fade-in animate-delay-300 px-4 sm:px-0">
            <Link 
              href="/products" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] active:scale-95 inline-block w-full sm:w-auto text-center"
            >
              {t('bookYourSession')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover-scale transition-all-300 animate-fade-in animate-delay-100">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('efficientRecovery')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('efficientRecoveryDesc')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover-scale transition-all-300 animate-fade-in animate-delay-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('enhancedPerformance')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('enhancedPerformanceDesc')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover-scale transition-all-300 animate-fade-in animate-delay-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('wellnessBoost')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('wellnessBoostDesc')}
            </p>
          </div>
        </div>

        {/* HBOT Benefits Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Hyperbaric Chambers
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Portable Soft Chamber</h3>
              <p className="text-gray-600 dark:text-gray-300">1.3 ATA, compact, ideal for home use. Quiet operation, easy setup.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Mid-Size Soft Chamber</h3>
              <p className="text-gray-600 dark:text-gray-300">1.5 ATA, spacious, reinforced build, premium materials.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Clinical Hard Chamber</h3>
              <p className="text-gray-600 dark:text-gray-300">Up to 2.0 ATA, medical-grade chamber for clinics and professionals.</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-16"></div>
        
        {/* HBOT Conditions Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose WellNex02
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Premium Materials</h3>
              <p className="text-gray-600 dark:text-gray-300">Durable, safe, and built to last with certified components.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">Ships quickly with careful packaging and tracking.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Expert Support</h3>
              <p className="text-gray-600 dark:text-gray-300">Guidance for setup, usage, and maintenance.</p>
            </div>
          </div>
        </div>

        <div className="text-center animate-fade-in animate-delay-400">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white animate-slide-in-up">{t('readyToExperience')}</h2>
          <Link 
            href="/contact" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] active:scale-95 animate-bounce inline-block w-full sm:w-auto text-center"
          >
            {t('contactUs')}
          </Link>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
