"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function Products() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="products" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            {t('productTitle')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            Discover our range of advanced hyperbaric oxygen chambers designed for optimal wellness and recovery.
          </p>
        </div>

        {/* Products Grid */}
        <div className="mb-16 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* O2 BOX T2-R */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => window.location.href = '/products/o2-box-t2r'}>
              <div className="text-center mb-6">
                <div className="mb-4">
                  <Image 
                    src="/O2BOXT2R.png" 
                    alt="O2 BOX T2-R" 
                    width={300}
                    height={200}
                    className="rounded-lg mx-auto object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('o2BoxT2R')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('o2BoxT2RDesc')}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">1.3 ATA pressure</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Compact design</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Easy setup</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Quiet operation</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
                  View Details & Purchase
                </div>
              </div>
            </div>

            {/* O2 BOX T68-R */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <Image 
                    src="/O2 BOX T68.png" 
                    alt="O2 BOX T68-R" 
                    width={300}
                    height={200}
                    className="rounded-lg mx-auto object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('o2BoxT68R')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('o2BoxT68RDesc')}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">1.3 ATA pressure</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Spacious interior</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Group sessions</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Advanced controls</span>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/products/o2-box-t68r" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
                  View Details & Purchase
                </Link>
              </div>
            </div>

            {/* O2 BOX T810-R W2000 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <Image 
                    src="/O2 BOX T810R W2000.png" 
                    alt="O2 BOX T810-R W2000" 
                    width={300}
                    height={200}
                    className="rounded-lg mx-auto object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('o2BoxT810R')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('o2BoxT810RDesc')}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">1.3 ATA pressure</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Large capacity</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Commercial use</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-300">Premium features</span>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/products/o2-box-t810r-w2000" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
                  View Details & Purchase
                </Link>
              </div>
            </div>
          </div>
          
          {/* Operational Items */}
          <div className="mt-8 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md inline-block max-w-md">
              <div className="mb-4">
                <Image 
                  src="/Control Device for O2 BOX.png" 
                  alt="Control Device for O2 BOX" 
                  width={250}
                  height={150}
                  className="rounded-lg mx-auto object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('operationalItems')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('operationalItemsDesc')}
              </p>
              <Link href="/products/operational-items" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block">
                {t('learnMore')}
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience Hyperbaric Oxygen Therapy?
            </h2>
            <p className="text-xl mb-6">
              Contact us today to learn more about our products and find the perfect solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                Contact Us
              </Link>
              <Link 
                href="/oxygen-therapy" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                Learn About Therapy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}


