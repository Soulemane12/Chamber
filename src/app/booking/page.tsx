"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BookingForm, BookingFormData } from "@/components/BookingForm";
import { formatCurrency } from "@/lib/utils";

// Pricing for different durations
const pricingOptions = {
  "60": 150,
  "90": 200,
  "120": 250,
};

export default function BookingPage() {
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingFormData | null>(null);

  const handleBookingComplete = (data: BookingFormData) => {
    setBookingDetails(data);
    setBookingComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Chamber
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link href="/" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li>
              <Link href="/booking" className="text-blue-600 dark:text-blue-400 font-medium">
                Book Now
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Book Your Hyperbaric Chamber Session
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Fill out the form below to schedule your hyperbaric oxygen therapy session.
          </p>
        </div>

        {bookingComplete ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in animate-delay-100">Booking Confirmed!</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 animate-fade-in animate-delay-200">
                Thank you for booking your hyperbaric chamber session.
              </p>
            </div>

            {bookingDetails && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 animate-fade-in animate-delay-300">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="animate-slide-in-left animate-delay-400">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bookingDetails.firstName} {bookingDetails.lastName}
                    </p>
                  </div>
                  <div className="animate-slide-in-right animate-delay-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{bookingDetails.email}</p>
                  </div>
                  <div className="animate-slide-in-left animate-delay-400">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(bookingDetails.date, "MMMM d, yyyy")} at {bookingDetails.time}
                    </p>
                  </div>
                  <div className="animate-slide-in-right animate-delay-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{bookingDetails.duration} minutes</p>
                  </div>
                  <div className="animate-slide-in-up animate-delay-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(pricingOptions[bookingDetails.duration as keyof typeof pricingOptions])}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center animate-fade-in animate-delay-500">
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] active:scale-95"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <BookingForm onBookingComplete={handleBookingComplete} />
          </div>
        )}
      </main>
    </div>
  );
} 