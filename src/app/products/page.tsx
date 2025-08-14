"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

export default function ProductsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="products" />
      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{t('productLineTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('productLineSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Portable Soft Chamber', desc: '1.3 ATA · Compact · Ideal for home use', img: '/HBOT.jpg', price: '$5,499' },
            { title: 'Mid-Size Soft Chamber', desc: '1.5 ATA · Spacious · Reinforced build', img: '/People_HBOT.jpg', price: '$8,999' },
            { title: 'Clinical Hard Chamber', desc: 'Up to 2.0 ATA · Medical-grade', img: '/HBOT.jpg', price: 'Contact' },
          ].map((p) => (
            <div key={p.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover-scale transition-all-300">
              <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                <Image src={p.img} alt={p.title} fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{p.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{p.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{p.price}</span>
                <a href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">{t('contact')}</a>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer className="mt-10" />
    </div>
  );
}


