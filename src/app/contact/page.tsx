"use client";

import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="contact" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            {t('contactTitle')}
          </h1>
        </div>

        {/* Contact Information */}
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              {t('contactUs')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center md:text-left">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t('mail')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('email')}
                  </p>
                </div>
                

              </div>
              
              <div className="text-center md:text-left">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Business Hours
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                    Saturday: 10:00 AM - 4:00 PM EST<br />
                    Sunday: Closed
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Location
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Serving the United States<br />
                    Based in New York
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                Get in Touch
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                We're here to help you explore the benefits of hyperbaric oxygen therapy. 
                Contact us for product information, pricing, or any questions you may have.
              </p>
              
              <div className="text-center">
                <a 
                  href={`mailto:${t('email')}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-block mr-4"
                >
                  Send Email
                </a>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}


