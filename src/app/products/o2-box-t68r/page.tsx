"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function O2BoxT68R() {
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
            <li className="text-gray-900 dark:text-white">O2 BOX T68-R</li>
          </ol>
        </nav>

        {/* Product Header */}
        <div className="mb-16 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
                O2 BOX T68-R
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 animate-slide-in-up animate-delay-200">
                Designed for the comfort of 6-8 Persons
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                The O2 BOX T68-R is our spacious hyperbaric oxygen chamber perfect for families, small groups, or wellness centers looking to provide oxygen therapy to multiple users simultaneously.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">1.3 ATA pressure for optimal safety</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Spacious interior for group sessions</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Advanced control systems</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">Professional-grade construction</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Perfect for Groups
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ideal for families, wellness centers, or small clinics that want to provide oxygen therapy to multiple users at once.
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
                <p>Length: 300cm</p>
                <p>Width: 120cm</p>
                <p>Height: 100cm</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Capacity</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Users: 6-8 persons</p>
                <p>Weight Capacity: 600kg</p>
                <p>Internal Volume: 3.6m³</p>
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
                <p>Power Consumption: 2.5kW</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Features</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Advanced Digital Control Panel</p>
                <p>Multi-User Comfort Design</p>
                <p>Emergency Release System</p>
                <p>Climate Control System</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Warranty</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Standard Warranty: 3 years</p>
                <p>Extended Options Available</p>
                <p>24/7 Support Hotline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Benefits of the O2 BOX T68-R
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Group Therapy Sessions</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Perfect for families, friends, or wellness centers that want to provide oxygen therapy to multiple users simultaneously.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Accommodates 6-8 people</li>
                <li>• Comfortable seating arrangement</li>
                <li>• Shared wellness experience</li>
                <li>• Cost-effective for groups</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Professional Features</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Advanced features designed for professional use while maintaining ease of operation for all users.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Advanced control systems</li>
                <li>• Climate control for comfort</li>
                <li>• Professional-grade construction</li>
                <li>• Enhanced safety features</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Perfect For
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Families</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Perfect for families who want to experience oxygen therapy together in the comfort of their home.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Wellness Centers</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ideal for wellness centers and spas looking to offer group oxygen therapy sessions to their clients.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Small Clinics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Perfect for small medical clinics or therapy centers that want to provide oxygen therapy to multiple patients.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience the O2 BOX T68-R?
            </h2>
            <p className="text-xl mb-6">
              Contact us today to learn more about this spacious hyperbaric oxygen chamber and find out if it's the right solution for your group therapy needs.
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
