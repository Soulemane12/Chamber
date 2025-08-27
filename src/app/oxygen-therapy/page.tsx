"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function OxygenTherapy() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="oxygenTherapy" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            {t('oxygenTherapyTitle')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            {t('oxygenTherapySubtitle')}
          </p>
        </div>

        {/* Introduction Section */}
        <div className="mb-16 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('oxygenTherapyDescription')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('oxygenTherapyDescription2')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('oxygenTherapyDescription3')}
            </p>
          </div>
        </div>

        {/* Marvels Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('marvelsTitle')}
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('oxygenBoostTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('oxygenBoostDescription')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('oxygenBoostDescription2')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('oxygenBoostDescription3')}
            </p>
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-16 animate-fade-in">
          <div className="w-full flex justify-center">
            <video 
              className="w-full max-w-[200px] md:max-w-[150px] lg:max-w-[120px] xl:max-w-[100px] mx-auto rounded-lg shadow-lg" 
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

        {/* Technical Details */}
        <div className="mb-16 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('typicalConditions')}
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('antiAging')}</h3>
              <Link href="#anti-aging" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('enhancedCognitive')}</h3>
              <Link href="#cognitive" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('recovery')}</h3>
              <Link href="#recovery" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('performance')}</h3>
              <Link href="#performance" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
          </div>
        </div>

        {/* Anti-Aging Section */}
        <div id="anti-aging" className="mb-16 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('antiAgingTitle')}
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('antiAgingHowItWorks')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('antiAgingHowItWorksDesc')}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('antiAgingBenefits')}
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">• {t('reduceWrinkles')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('improveElasticity')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('healthyGlow')}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('embraceYouthful')}
            </p>
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
              {t('contactUs')}
            </Link>
          </div>
        </div>

        {/* Enhanced Cognitive Section */}
        <div id="cognitive" className="mb-16 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('enhancedCognitiveTitle')}
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('enhancedCognitiveHowItWorks')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('enhancedCognitiveHowItWorksDesc')}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('enhancedCognitiveBenefits')}
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">• {t('boostMemory')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('increaseFocus')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('improveMood')}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('unlockPotential')}
            </p>
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
              {t('contactUs')}
            </Link>
          </div>
        </div>

        {/* Recovery Section */}
        <div id="recovery" className="mb-16 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('recoveryTitle')}
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('recoveryHowItWorks')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('recoveryHowItWorksDesc')}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('recoveryBenefits')}
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">• {t('speedUpHealing')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('reduceInflammation')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('enhanceRecovery')}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('experienceAdvantages')}
            </p>
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
              {t('contactUs')}
            </Link>
          </div>
        </div>

        {/* Performance Section */}
        <div id="performance" className="mb-16 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('performanceTitle')}
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('performanceHowItWorks')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('performanceHowItWorksDesc')}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                {t('performanceBenefits')}
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">• {t('boostEndurance')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('increaseStrength')}</p>
                <p className="text-gray-600 dark:text-gray-300">• {t('fasterRecovery')}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('optimizePerformance')}
            </p>
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
