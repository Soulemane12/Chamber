"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OperatingHours } from "@/components/OperatingHours";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header currentPage="home" />

      <main className="flex-1 flex flex-col lg:flex-row items-stretch">
        {/* Left Column - Guy Image */}
        <div className="relative w-full h-[50vh] lg:h-auto lg:w-1/2 bg-black animate-slide-in-left">
          <Image
            src="/guy.png"
            alt="Midtown Biohack Character"
            fill
            className="object-contain object-center lg:object-right"
            priority
            quality={85}
          />
        </div>

        {/* Right Column - Content */}
        <div className="flex-1 lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10 lg:py-12 bg-black">
          {/* Logo */}
          <div className="mb-6 lg:mb-8 animate-fade-in">
            <Image
              src="/midtown_logo.png"
              alt="Midtown Biohack Logo"
              width={150}
              height={150}
              className="h-24 sm:h-28 lg:h-32 w-auto object-contain"
              priority
            />
          </div>

          {/* Welcome Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 text-center animate-slide-in-up animate-delay-100">
            Welcome to Midtown Biohack™
          </h1>

          {/* Subheading - Columbia Blue */}
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-5 text-center animate-slide-in-up animate-delay-200" style={{ color: '#9BDDFF' }}>
            New York's private human performance and recovery Lab
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-5 max-w-2xl text-center leading-relaxed animate-fade-in animate-delay-300">
            This is your access point to our concierge service designed specifically for you to help recover faster, perform better and live with greater clarity and energy
          </p>

          {/* CTA Text */}
          <p className="text-base sm:text-lg lg:text-xl text-white mb-6 font-medium text-center animate-slide-in-up animate-delay-400">
            Click below to start your Journey
          </p>

          {/* Button Group */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-md animate-scale-in animate-delay-500">
            <Link
              href="/booking"
              className="flex-1 px-8 py-3 text-base font-bold rounded-lg text-black text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                backgroundColor: '#9BDDFF',
                boxShadow: '0 4px 20px rgba(155, 221, 255, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#7ECCFF';
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(155, 221, 255, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9BDDFF';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(155, 221, 255, 0.5)';
              }}
            >
              Book Now
            </Link>
            <a
              href="https://midtownbiohack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-8 py-3 text-base font-bold rounded-lg text-center transition-all duration-300 hover:scale-105"
              style={{
                border: '2px solid #9BDDFF',
                color: '#9BDDFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#9BDDFF';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9BDDFF';
              }}
            >
              Website
            </a>
          </div>

          {/* Contact Email */}
          <p className="text-xs sm:text-sm lg:text-base text-gray-400 text-center animate-fade-in animate-delay-500">
            More information: <a
              href="mailto:contact@midtownbiohack"
              className="transition-colors"
              style={{ color: '#9BDDFF' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7ECCFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9BDDFF'}
            >
              contact@midtownbiohack
            </a>
          </p>

          {/* Operating Hours */}
          <div className="mt-8 w-full max-w-md animate-fade-in animate-delay-600">
            <OperatingHours />
          </div>
        </div>
      </main>

      <Footer className="bg-black border-t border-gray-800" />
    </div>
  );
}
