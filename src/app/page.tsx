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
        {/* Hero Section */}
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
              {t('getStarted')}
            </Link>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('welcomeTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {t('welcomeSubtitle')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('welcomeDescription')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('discoverText')}
            </p>
            <div className="text-center">
              <Link 
                href="/about" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                {t('readMore')}
              </Link>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-16 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <video 
              className="w-full rounded-lg shadow-lg" 
              controls 
              preload="metadata"
              poster="/logo.png"
            >
              <source src="/Wellnex_vid.MOV" type="video/quicktime" />
              <source src="/Wellnex_vid.MOV" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Why Choose Wellnex02 Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('whyChooseTitle')}
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('scienceDrivenWellness')}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('durableUserFriendly')}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('inspiredByTradition')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Series Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('recoverySeriesTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('recoverySeriesDescription')}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('productTitle')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('o2BoxT2R')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('o2BoxT2RDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('o2BoxT68R')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('o2BoxT68RDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('o2BoxT810R')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('o2BoxT810RDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md inline-block">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('operationalItems')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('operationalItemsDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
          </div>
        </div>

        {/* Experience Future Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('experienceFutureTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('experienceFutureDescription')}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Wellnex02
            </h3>
            <p className="text-xl mb-6">
              Join the movement toward better health and vitality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-white text-green-600 px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                Contact Us
              </Link>
              <Link 
                href="/about" 
                className="bg-white text-green-600 px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                Learn More
              </Link>
              <Link 
                href="/products" 
                className="bg-white text-green-600 px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
