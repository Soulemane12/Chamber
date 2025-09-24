"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function O2BoxT2R() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestLevel: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/send-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          product: 'O2 BOX T2-R (1-2 Persons)',
          contactType: 'business'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage('Thank you for your inquiry! We will contact you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          interestLevel: '',
          message: ''
        });
      } else {
        setSubmitMessage('There was an error submitting your inquiry. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitMessage('There was an error submitting your inquiry. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
                O2 BOX T2-R
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 animate-slide-in-up animate-delay-200">
                Model: T2-R
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up animate-delay-200">
                Designed for the comfort of 1-2 Persons
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <Image 
                  src="/O2BOXT2R.png" 
                  alt="O2 BOX T2-R Hyperbaric Chamber" 
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg object-contain"
                  priority
                />
              </div>
            </div>
          </div>
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
                    <strong>Model:</strong> T2-R (Horizontally long type)
                  </p>
                  
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Dimensions</h4>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p><strong>Main Body Outer Dimension:</strong></p>
                    <p>H60.67 in x W79.13 in x D37.80 in</p>
                    <p><strong>Main Body Inside Dimension:</strong></p>
                    <p>H54.49 in x W72.24 in x D30.87 in</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Technical Specifications</h4>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p><strong>Total Weight:</strong> 1014.13 lbs</p>
                    <p><strong>Entrance Size:</strong></p>
                    <p>Height: 45.47 in, Width: 25.00 in</p>
                    <p><strong>Component:</strong></p>
                    <p>Control device x 1 (included)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Inquire About O2 BOX T2-R
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Contact us for availability and customization options
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Product Info */}
              <div className="space-y-8">
                {/* Included Items */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Included with Purchase
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Delivery & Installation</li>
                    <li>• TV</li>
                    <li>• Chairs</li>
                    <li>• AC</li>
                    <li>• 3-year warranty</li>
                  </ul>
                </div>

                {/* Optional Add-ons */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Optional Add-ons Available
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Premium couch</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Stadium seating</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Air conditioner unit</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Massage table</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Ottoman</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Custom wrap</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Custom logo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Inquiry Form */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Request Information
                </h3>
                
                {submitMessage && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    submitMessage.includes('Thank you')
                      ? 'bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Interest Level
                    </label>
                    <select
                      name="interestLevel"
                      value={formData.interestLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="">Select your interest level</option>
                      <option value="immediate">Immediate Purchase</option>
                      <option value="3months">Within 3 months</option>
                      <option value="6months">Within 6 months</option>
                      <option value="exploring">Just exploring options</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Questions or Requirements
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Tell us about your specific needs, location, or any questions you have..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    We'll contact you within 24 hours with detailed information.
                  </p>
                </form>
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
