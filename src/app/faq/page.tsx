"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

export default function FAQ() {
  const { t } = useLanguage();
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const faqItems = [
    {
      question: t('isHBOTSafe'),
      answer: t('isHBOTSafeAnswer')
    },
    {
      question: t('howSoonBenefits'),
      answer: "The timeline for experiencing benefits varies from person to person. Some individuals may notice improvements after just a few sessions, while others may require more time. Most people report feeling more energized and experiencing better sleep quality within the first week of regular sessions."
    },
    {
      question: t('howOxygenMade'),
      answer: "The oxygen used in our chambers is medical-grade oxygen that is purified and concentrated. Our systems include advanced filtration and concentration technology to ensure the highest quality oxygen delivery for optimal therapeutic benefits."
    },
    {
      question: t('howLongSession'),
      answer: "Typical HBOT sessions last between 60-90 minutes, including pressurization and depressurization time. The actual therapy time at full pressure is usually 45-60 minutes. Session duration may vary based on individual needs and treatment protocols."
    },
    {
      question: t('reactiveOxygenSpecies'),
      answer: "Reactive oxygen species (ROS) are naturally occurring molecules that can be both beneficial and harmful. In controlled HBOT sessions, the increased oxygen levels help your body's natural antioxidant systems work more effectively, promoting healing while minimizing any potential oxidative stress."
    },
    {
      question: t('isChamberNoisy'),
      answer: "Our chambers are designed with noise reduction technology to provide a quiet and peaceful experience. The operational noise is minimal and comparable to a gentle hum, allowing you to relax, read, or even sleep during your session."
    },
    {
      question: t('whatMaintenance'),
      answer: "Our chambers require minimal maintenance. Regular cleaning of the interior surfaces and periodic inspection of seals and components is recommended. We provide comprehensive maintenance guidelines and support to ensure optimal performance and longevity."
    },
    {
      question: t('anyDisadvantages'),
      answer: "HBOT is generally very safe when used as directed. Some individuals may experience mild ear pressure during pressurization, similar to flying in an airplane. This can be easily managed with simple techniques like yawning or swallowing. We provide detailed instructions to ensure a comfortable experience."
    },
    {
      question: t('howDiffers'),
      answer: "Our O2Box series stands out through its innovative design, Japanese engineering standards, and user-friendly automation. We offer the first completely unmanned models in the industry, with advanced safety features and superior build quality that ensures durability and reliability."
    },
    {
      question: t('maxAtmosphericPressure'),
      answer: "Our chambers operate at a consumer-friendly 1.3 ATA (atmospheres absolute), which provides significant therapeutic benefits while maintaining maximum safety and comfort. This pressure level is ideal for daily use and wellness applications."
    },
    {
      question: t('howDurable'),
      answer: "Our chambers are built to the highest Japanese manufacturing standards using premium materials. They are designed for years of reliable use with proper maintenance. The robust construction and quality components ensure long-term durability and performance."
    },
    {
      question: t('earDiscomfort'),
      answer: "If you experience ear discomfort during pressurization, try yawning, swallowing, or gently pinching your nose and blowing gently. These techniques help equalize pressure in your ears. If discomfort persists, you can signal to pause the session, and we'll help you adjust the pressure gradually."
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="faq" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            {t('faqTitle')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            {t('frequentlyAskedQuestions')}
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {item.question}
                  </h3>
                  <svg
                    className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform ${
                      openQuestion === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openQuestion === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
