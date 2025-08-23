"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function O2BoxT2R() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="products" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white">O2 BOX T2-R</li>
          </ol>
        </nav>

        {/* Product Header */}
        <div className="mb-16 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
                O2 BOX T2-R
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 animate-slide-in-up animate-delay-200">
                Designed for the comfort of 1-2 Persons
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                The O2 BOX T2-R is our compact, personal hyperbaric oxygen chamber perfect for individuals or couples seeking the benefits of oxygen therapy in the comfort of their own space.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">1.3 ATA pressure for optimal safety</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Compact design fits in any room</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Easy setup and operation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Quiet operation for peaceful sessions</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block text-center"
                >
                  Request Quote
                </Link>
                <Link 
                  href="/booking" 
                  className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block text-center"
                >
                  Book Demo
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Perfect for Personal Use
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ideal for individuals or couples who want to experience the benefits of hyperbaric oxygen therapy in their own space.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Technical Specifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Dimensions</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Length: 200cm</p>
                <p>Width: 80cm</p>
                <p>Height: 80cm</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Capacity</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Users: 1-2 persons</p>
                <p>Weight Capacity: 200kg</p>
                <p>Internal Volume: 1.28m³</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pressure</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Operating Pressure: 1.3 ATA</p>
                <p>Safety Standards: CE Marked</p>
                <p>Medical Device Class IIb</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Power</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Voltage: 100-240V AC</p>
                <p>Frequency: 50/60Hz</p>
                <p>Power Consumption: 1.5kW</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Features</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Digital Control Panel</p>
                <p>Automatic Pressure Control</p>
                <p>Emergency Release System</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Warranty</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Standard Warranty: 2 years</p>
                <p>Extended Options Available</p>
                <p>24/7 Support Hotline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Benefits of the O2 BOX T2-R
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Perfect for Home Use</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The compact design makes it ideal for home environments. Easy to set up and operate, allowing you to enjoy oxygen therapy sessions at your convenience.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Fits in most rooms</li>
                <li>• Quiet operation</li>
                <li>• Easy maintenance</li>
                <li>• User-friendly controls</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Health Benefits</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Experience the full range of hyperbaric oxygen therapy benefits in the comfort of your own space.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Enhanced recovery</li>
                <li>• Improved energy levels</li>
                <li>• Better sleep quality</li>
                <li>• Anti-aging effects</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience the O2 BOX T2-R?
            </h2>
            <p className="text-xl mb-6">
              Contact us today to learn more about this compact hyperbaric oxygen chamber and find out if it's the right solution for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                Get Quote
              </Link>
              <Link 
                href="/products" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block"
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
