"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BookingForm, BookingFormData } from "@/components/BookingForm";
import { AssessmentForm, AssessmentFormData } from "@/components/AssessmentForm";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/LanguageContext";

import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { Footer } from "@/components/Footer";

// Pricing for different durations
const pricingOptions = {
  "60": 150,
  "90": 200,
  "120": 250,
};

// Helper functions
const getGoogleMapsUrl = (address: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

// Function to get location contact data
const getLocationData = (location: string) => {
  return {
    owner: "ATMOS Hyperbaric",
    phone: "+1 (646) 262-8794",
    email: "info@atmoshyperbaric.com"
  };
};

export default function BookingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingFormData | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleBookingComplete = (data: BookingFormData) => {
    setBookingDetails(data);
    setShowAssessment(true);
    window.scrollTo(0, 0);
  };

  const handleAssessmentComplete = (data: AssessmentFormData) => {
    setAssessmentComplete(true);
    setShowAssessment(false);
    setBookingComplete(true);
  };

  // Create a function to get location information for confirmation
  const getBookingLocation = () => {
    return {
      name: "ATMOS Hyperbaric",
      address: "166 laurel rd, east north NY, 11731",
      contact: {
        owner: "ATMOS Hyperbaric",
        phone: "+1 (646) 262-8794",
        email: "info@atmoshyperbaric.com"
      }
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 animate-pulse">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading Booking Page</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we prepare your booking form...</p>
              <div className="w-full max-w-md">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Head>
        <title>ATMOS Hyperbaric - Book a Session</title>
      </Head>
      <Header currentPage="booking" />

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('bookingTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('bookingSubtitle')}
          </p>
          
          {!isAuthenticated && !bookingComplete && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Guest Booking</h3>
                  <div className="mt-1 text-sm text-amber-700 dark:text-amber-200">
                    <p>You&apos;re booking as a guest. <Link href="/login?redirect=/booking" className="font-medium text-amber-800 dark:text-amber-300 underline hover:text-amber-900">Sign in</Link> or <Link href="/signup?redirect=/booking" className="font-medium text-amber-800 dark:text-amber-300 underline hover:text-amber-900">create an account</Link> to save your booking history and personal information for future visits.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {bookingDetails && !bookingComplete ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8 animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in animate-delay-100">Complete Your Assessment</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 animate-fade-in animate-delay-200">
                Please complete a quick wellness assessment before confirming your booking
              </p>
            </div>

            {/* Assessment Form Section */}
            {showAssessment && !assessmentComplete && (
              <div className="w-full max-w-4xl mx-auto">
                <AssessmentForm 
                  onAssessmentComplete={handleAssessmentComplete}
                  bookingId={bookingDetails?.id}
                  autoFillDate={bookingDetails?.date}
                  autoFillTime={bookingDetails?.time}
                  autoFillFirstName={bookingDetails?.firstName}
                  autoFillLastName={bookingDetails?.lastName}
                />
              </div>
            )}
          </div>
        ) : bookingComplete ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in animate-delay-100">{t('bookingConfirmed')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 animate-fade-in animate-delay-200">
                {t('thankYou')}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-2 animate-fade-in animate-delay-300">
                {t('emailConfirmation')} {bookingDetails?.email}
              </p>
            </div>

            <div className="flex justify-center mb-6 animate-fade-in animate-delay-200">
              <div className="relative w-full max-w-[200px] md:max-w-[250px] h-24 md:h-28 overflow-hidden rounded-lg bg-white p-2">
                <Image
                  src="/atmos_screenshot.png"
                  alt="ATMOS Hyperbaric"
                  width={400}
                  height={200}
                  style={{objectFit: "contain", width: "100%", height: "100%"}}
                  priority
                />
              </div>
            </div>

            {bookingDetails && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 animate-fade-in animate-delay-300">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('bookingDetails')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="animate-slide-in-left animate-delay-400">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('name')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bookingDetails.firstName} {bookingDetails.lastName}
                    </p>
                  </div>
                  <div className="animate-slide-in-right animate-delay-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('email')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{bookingDetails.email}</p>
                  </div>
                  <div className="animate-slide-in-left animate-delay-400">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('dateAndTime')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(bookingDetails.date, "MMMM d, yyyy")} at {bookingDetails.time}
                    </p>
                  </div>
                  <div className="animate-slide-in-right animate-delay-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('duration')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{bookingDetails.duration} {t('minutes')}</p>
                  </div>
                  <div className="animate-slide-in-left animate-delay-400">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('location')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ATMOS Hyperbaric
                    </p>
                  </div>
                  <div className="animate-slide-in-right animate-delay-500 md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('address')}</p>
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-900 dark:text-white break-words">
                        166 laurel rd, east north NY, 11731
                      </p>
                      {bookingDetails.location && (
                        <div className="flex flex-col gap-2 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('rideShare')}:</p>
                          <div className="flex flex-wrap gap-2">
                          <a 
                            href={getGoogleMapsUrl("166 laurel rd, east north NY, 11731")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="break-words">{t('viewOnGoogleMaps')}</span>
                          </a>
                          
                          <a 
                            href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent("166 laurel rd, east north NY, 11731")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black dark:text-white text-sm hover:underline flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                          >
                            <svg className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-16.5c-3.58 0-6.5 2.92-6.5 6.5s2.92 6.5 6.5 6.5 6.5-2.92 6.5-6.5-2.92-6.5-6.5-6.5zm0 11c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" />
                            </svg>
                            <span>{t('getUber')}</span>
                          </a>
                          
                          <a 
                            href={`https://ride.lyft.com/ridetype?q=${encodeURIComponent("166 laurel rd, east north NY, 11731")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FF00BF] dark:text-[#FF00BF] text-sm hover:underline flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                          >
                            <svg className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 512 512" fill="currentColor">
                              <path d="M0 81.1h77.8v208.7c0 33.1 15 52.8 27.2 61-12.7 11.1-51.2 20.9-80.2-2.8C7.8 331 0 310.7 0 289V81.1zm435.2 18.9h-77.9v208.7c0 33.1-15 52.8-27.2 61 12.7 11.1 51.2 20.9 80.2-2.8 17-17 27.1-37.3 27.1-59.1V100zM256 50.5c-47.1 0-88.6 34.8-96.6 82-7.4 34.5 7.7 70.5 38.3 89.9 30.5 19.3 71.8 13.1 93.9-13.3 22.7-26.6 19.5-65.8-2.6-89.9-10.9-12-24.3-21.3-39.3-26.8C239.3 88.3 228.3 87 217 87.8c-11.3.8-22.5 4.8-31.6 11.6-9.1 6.8-16.5 16.2-20.8 26.7-4.3 10.5-5.9 22.1-4.3 33.3 1.6 11.2 6.3 22 13.8 30.6 15 17.2 38.1 25.3 61.5 23.5-7.5 8.4-18.1 14-29.2 14.8-11.1.9-22.9-2.7-32.5-9.2-19.1-13.1-28.6-39.8-28.6-39.8-1.7-9.4 0-19.3 4.4-27.4 4.4-8.1 12-14.4 20.5-17.5 16.9-6.2 38.5-5.1 55.1 1 16.6 6.1 31 17.9 39.4 33.5 8.5 15.6 9.4 35 2.5 51.3-6.9 16.3-23 30.3-41.1 33.9-18.1 3.5-38.7-4.9-51.5-18.5 11.3 35.7 58.5 57.8 95.2 38.1 18.3-9.9 30.5-29.2 32.6-50 2.1-20.8-5.1-42.9-19.4-58.6-14.4-15.7-36.3-24.5-58.9-24.1z"/>
                            </svg>
                            <span>{t('getLyft')}</span>
                          </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Add seat information */}
                  {bookingDetails.selectedSeats && bookingDetails.selectedSeats.some(seat => seat.selected) && (
                    <div className="md:col-span-2 animate-slide-in-up animate-delay-500">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Selected Seats</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {bookingDetails.selectedSeats
                          .filter(seat => seat.selected)
                          .map(seat => (
                            <span key={seat.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded dark:bg-blue-900 dark:text-blue-300">
                              Seat {seat.id}{seat.name ? `: ${seat.name}` : ''}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center space-y-4 animate-fade-in animate-delay-500">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg w-full max-w-md mx-auto animate-fade-in">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  ATMOS Hyperbaric Contact
                </h4>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {t('owner')}: {getBookingLocation().contact.owner}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {getBookingLocation().contact.email}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center w-full">
                <Link
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] active:scale-95 w-full sm:w-auto text-center"
                >
                  {t('returnToHome')}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <BookingForm onBookingComplete={handleBookingComplete} isAuthenticated={isAuthenticated} />
          </div>
        )}
      </main>

      <Footer className="mt-20" showSocials={false} />
    </div>
  );
} 