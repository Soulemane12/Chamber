"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<'midtown' | 'platinum'>('midtown');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header currentPage="home" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-in-up">
            {t('heroTitle')}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            {t('heroSubtitle')}
          </p>
          <div className="mt-10 animate-fade-in animate-delay-300 px-4 sm:px-0">
            <Link
              href="/products"
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 inline-block w-full sm:w-auto text-center min-h-[44px] flex items-center justify-center"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {t('welcomeTitle')}
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              {t('welcomeSubtitle')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('welcomeDescription')}
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              {t('discoverText')}
            </p>
            <div className="text-center">
              <Link
                href="/about"
                className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block min-h-[44px] flex items-center justify-center mb-8"
              >
                {t('readMore')}
              </Link>
              <div className="mt-6 flex justify-center">
                <div className="max-w-[600px] mx-auto">
                  <video 
                    src="/Wellnex_vid.MOV" 
                    controls 
                    className="w-full rounded-lg shadow-lg"
                    width="600"
                    height="338"
                    style={{ maxWidth: '600px', maxHeight: '338px', margin: '0 auto' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>

        

        {/* Why Choose Wellnex02 Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {t('whyChooseTitle')}
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-gray-300 leading-relaxed">
                  {t('scienceDrivenWellness')}
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-gray-300 leading-relaxed">
                  {t('durableUserFriendly')}
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
                <p className="text-gray-300 leading-relaxed">
                  {t('inspiredByTradition')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Series Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {t('recoverySeriesTitle')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('recoverySeriesDescription')}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {t('productTitle')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-white">{t('o2BoxT2R')}</h3>
              <p className="text-gray-300 mb-4">{t('o2BoxT2RDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-white">{t('o2BoxT68R')}</h3>
              <p className="text-gray-300 mb-4">{t('o2BoxT68RDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-white">{t('o2BoxT810R')}</h3>
              <p className="text-gray-300 mb-4">{t('o2BoxT810RDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-gray-800 p-6 rounded-xl shadow-md inline-block">
              <h3 className="text-xl font-semibold mb-3 text-white">{t('operationalItems')}</h3>
              <p className="text-gray-300 mb-4">{t('operationalItemsDesc')}</p>
              <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('learnMore')}
              </Link>
            </div>
          </div>
        </div>

        {/* In-Person Demo Sites Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Experience Our Products In-Person
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Book a demo session at one of our partner locations to experience hyperbaric oxygen therapy firsthand
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-lg p-4">
              {/* Tab Navigation */}
              <div className="flex flex-col sm:flex-row mb-4 border-b border-gray-700">
                <button 
                  className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                    selectedLocation === 'midtown' 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setSelectedLocation('midtown')}
                >
                  Midtown Biohack
                </button>
                <button 
                  className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                    selectedLocation === 'platinum' 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setSelectedLocation('platinum')}
                >
                  Platinum Wellness
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Location Info */}
                <div>
                  {selectedLocation === 'midtown' ? (
                    <div>
                        <h3 className="text-xl font-bold mb-3 text-white">Midtown Biohack</h3>
                        <p className="text-gray-300 mb-3 text-sm">
                          Experience our hyperbaric oxygen chambers in a professional wellness environment. 
                          Our Midtown location offers personalized sessions and expert guidance.
                        </p>
                        <div className="space-y-1 text-gray-300 text-sm">
                        <p><strong>📍 Address:</strong> 575 Madison Ave, 23rd Floor, New York, NY 10022</p>
                        <p><strong>🕒 Hours:</strong> Mon-Fri 9AM-7PM, Sat 10AM-4PM</p>
                        <p><strong>📞 Phone:</strong> (555) 123-4567</p>
                      </div>
                      
                      {/* Video Section */}
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-2 text-white">Take a Virtual Tour</h4>
                        <div className="bg-gray-100 bg-gray-600 p-3 rounded-lg">
                          <p className="text-xs text-gray-300 mb-2">
                            Video tour of our Midtown Biohack location
                          </p>
                            <video 
                              controls 
                              className="w-full max-w-xs h-170 rounded-lg shadow-md object-cover"
                              poster="/HBOT.jpg"
                              preload="metadata"
                            >
                              <source src="/midtown_vid.mp4" type="video/mp4" />
                            </video>
                         
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-white">Platinum Wellness</h3>
                      <p className="text-gray-300 mb-2 text-xs">
                        Discover the transformative power of hyperbaric oxygen therapy at our Platinum Wellness center. 
                        Multiple locations available for your convenience.
                      </p>
                      <div className="space-y-0.5 text-gray-300 text-xs">
                        <p><strong>📍 Locations:</strong> 1990 Parker Rd SE, Conyers, GA 30094</p>
                        <p><strong>🕒 Hours:</strong> Mon-Fri 8AM-8PM, Sat-Sun 9AM-6PM</p>
                        <p><strong>📞 Phone:</strong> (555) 987-6543</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Booking Form */}
                  <div className="bg-gray-50 bg-gray-700 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold mb-3 text-white">Schedule Your Demo</h4>
                    <p className="text-sm text-gray-300 mb-6">Experience our hyperbaric oxygen therapy chambers and discover the benefits for your wellness journey.</p>
                    <form className="space-y-6">
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-3">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 text-base border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-3">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 text-base border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 dark:text-white"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-3">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 text-base border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 dark:text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-3">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 text-base border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-3">
                        Preferred Time *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 text-base border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 dark:text-white"
                      >
                        <option value="">Select a time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-3">
                        Special Requests
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 text-base border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 dark:text-white"
                        placeholder="Any specific questions or requirements?"
                      ></textarea>
                    </div>
                    
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-lg text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Book Demo Session
                      </button>
                    
                  
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Future Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {t('experienceFutureTitle')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('experienceFutureDescription')}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">
              Wellnex02
            </h3>
            <p className="text-xl mb-6">
              Join the movement towards better health and vitality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn bg-white text-green-700 px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block min-h-[44px] flex items-center justify-center w-full sm:w-auto"
              >
                Contact Us
              </Link>
              <Link
                href="/about"
                className="btn bg-white text-green-700 px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block min-h-[44px] flex items-center justify-center w-full sm:w-auto"
              >
                Learn More
              </Link>
              <Link
                href="/products"
                className="btn bg-white text-green-700 px-6 py-2 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block min-h-[44px] flex items-center justify-center w-full sm:w-auto"
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
