"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  isBusiness: boolean;
  message: string;
}

export function ContactForm() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    isBusiness: false,
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Here you would typically send the data to your API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({
        name: "",
        email: "",
        phone: "",
        businessName: "",
        isBusiness: false,
        message: ""
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {t('contactUs')}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business/Residential Toggle */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="isBusiness"
              checked={!formData.isBusiness}
              onChange={() => setFormData(prev => ({ ...prev, isBusiness: false }))}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">{t('residential')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="isBusiness"
              checked={formData.isBusiness}
              onChange={() => setFormData(prev => ({ ...prev, isBusiness: true }))}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">{t('business')}</span>
          </label>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('phone')} *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Business Name - only show if business is selected */}
        {formData.isBusiness && (
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('businessName')} *
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required={formData.isBusiness}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('message')}
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded-md">
            {t('messageSent')}
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded-md">
            {t('messageError')}
          </div>
        )}
      </form>
    </div>
  );
}
