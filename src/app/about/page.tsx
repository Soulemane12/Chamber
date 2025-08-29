"use client";

import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function About() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="about" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            {t('aboutUs')}
          </h1>
        </div>

        {/* About Our Company Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('aboutOurCompany')}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('aboutDescription')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('aboutDescription2')}
            </p>
          </div>
        </div>

        {/* Our Journey Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('ourJourney')}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('journeyDescription')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('journeyDescription2')}
            </p>
          </div>
        </div>

        {/* Our Customers Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('ourCustomers')}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              We take pride in providing products that are:
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">•</span>
                <p className="text-gray-600 dark:text-gray-300">{t('madeInJapan')}</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">•</span>
                <p className="text-gray-600 dark:text-gray-300">{t('userFriendly')}</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">•</span>
                <p className="text-gray-600 dark:text-gray-300">{t('maintainedWithExcellence')}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-6 leading-relaxed">
              By launching Wellness O2 in the U.S. market, we strive to share the advantages of our innovative technology and holistic health approach, which is grounded in Japanese principles of longevity and wellness.
            </p>
          </div>
        </div>

        {/* Our Technology Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('ourTechnology')}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('technologyDescription')}
            </p>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('innovationAndExcellence')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('innovationDescription')}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('ourDedication')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {t('dedicationDescription')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <p className="text-gray-600 dark:text-gray-300">{t('afterSalesSupport')}</p>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <p className="text-gray-600 dark:text-gray-300">{t('salesKnowHow')}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('lookingAhead')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('lookingAheadDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <p className="text-lg leading-relaxed">
              {t('thankYou')}
            </p>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
