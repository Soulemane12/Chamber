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
              href="/booking" 
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
              🌿 5 Wellness-Level Benefits of HBOT
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Enhanced Immune Function</h3>
              <p className="text-gray-600 dark:text-gray-300">
                HBOT boosts white blood cell activity and helps the body fight infections more effectively.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Increased Stem Cell Production</h3>
              <p className="text-gray-600 dark:text-gray-300">
                It stimulates the release and activity of stem cells, which are essential for tissue repair and regeneration.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Improved Cognitive Function</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Some studies suggest HBOT may enhance memory, focus, and mental clarity, especially in aging individuals or those recovering from brain injuries.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Reduced Inflammation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The therapy has anti-inflammatory effects, which can help with chronic pain and inflammatory conditions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Better Physical Recovery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Athletes and active individuals use HBOT to speed up recovery from workouts, injuries, and surgeries by improving oxygen delivery to tissues.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-16"></div>
        
        {/* HBOT Conditions Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              🩺 5 Conditions Commonly Treated with HBOT
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Chronic Wounds</h3>
              <p className="text-gray-600 dark:text-gray-300">
                HBOT promotes healing in wounds that are slow to close due to poor circulation or infection.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Carbon Monoxide Poisoning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                It helps displace carbon monoxide from hemoglobin, restoring oxygen delivery to tissues.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Radiation Injuries</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Used to treat tissue damage caused by radiation therapy, such as in cancer patients.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Decompression Sickness</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Common in divers, HBOT helps eliminate nitrogen bubbles from the bloodstream.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover-scale transition-all-300">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Severe Infections</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The high-oxygen environment inhibits the growth of anaerobic bacteria and supports immune systems.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center animate-fade-in animate-delay-400">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white animate-slide-in-up">{t('readyToExperience')}</h2>
          <Link 
            href="/booking" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] active:scale-95 animate-bounce inline-block w-full sm:w-auto text-center"
          >
            {t('bookYourSessionNow')}
          </Link>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
