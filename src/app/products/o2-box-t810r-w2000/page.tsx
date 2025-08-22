"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function O2BoxT810RW2000Page() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="products" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            O2 BOX T810-R W2000
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            Model: T810-R W2000
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            Designed for the comfort of 8-10 Persons
          </p>
        </div>

        {/* Product Specifications */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Product Specifications
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Model Details</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <strong>Model:</strong> T810-R W2000 (Horizontally long type)
                  </p>
                  
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Dimensions</h4>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p><strong>Main Body Outer Dimension:</strong></p>
                    <p>H77.95 in x W119.29 in x D80.71 in</p>
                    <p><strong>Main Body Inside Dimension:</strong></p>
                    <p>H71.42 in x W112.32 in x D73.74 in</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Technical Specifications</h4>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p><strong>Total Weight:</strong> 3444.90 lbs</p>
                    <p><strong>Entrance Size:</strong></p>
                    <p>Height: 45.47 in, Width: 25.00 in</p>
                    <p><strong>Component:</strong></p>
                    <p>Control device x1, Adjunct pump x2 (Included)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lease Options */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Lease Options
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                We are proud to offer products that are:
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Under normal conditions, the partial pressure of oxygen (pO2) in our arteries is approximately 100 mm Hg. However, when utilizing a hyperbaric chamber set to 1.3 ATA (atmospheres absolute), the arterial pO2 can rise to about 170 mm Hg under optimal circumstances, resulting in an increase of around 70% compared to standard atmospheric conditions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">✅ Anti-Aging: Revitalize Your Skin with Oxygen</h4>
                  <Link href="/oxygen-therapy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Learn More
                  </Link>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">✅ Enhanced Cognitive Function: Energize Your Brain with Oxygen</h4>
                  <Link href="/oxygen-therapy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Learn More
                  </Link>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">✅ Recovery: Heal Faster, Live Stronger</h4>
                  <Link href="/oxygen-therapy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Learn More
                  </Link>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">✅ Performance: Optimize Your Performance with Oxygen</h4>
                  <Link href="/oxygen-therapy" className="text-blue-600 hover:text-blue-700 font-medium">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center">
            <Link 
              href="/contact" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] active:scale-95 inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
