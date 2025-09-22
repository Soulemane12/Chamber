"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

// Form validation schema
const hipHopBookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  services: z.array(z.enum([
    "hbot",
    "electric-exercise", 
    "pemf",
    "nmr",
    "nutrition"
  ])).min(1, "Please select at least one service"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  notes: z.string().optional(),
});

type HipHopBookingData = z.infer<typeof hipHopBookingSchema>;

const services = [
  {
    id: "hbot",
    title: "Luxury Hyperbaric Oxygen Therapy (HBOT)",
    description: "3 sessions in our spa-grade O₂ Box to accelerate healing, reduce inflammation, and boost brain function. This is not a capsule but a small room with stadium seats, AC, and a flat screen TV.",
    icon: "🫁"
  },
  {
    id: "electric-exercise",
    title: "Electric Exercise",
    description: "One EMS-powered session per week targeting specific muscle groups delivers the effect of up to 50,000 crunches in just 30 minutes without breaking a sweat.",
    icon: "⚡"
  },
  {
    id: "pemf",
    title: "PEMF Therapy",
    description: "One session per week of Pulsed Electromagnetic Field (PEMF) therapy to accelerate cellular repair, reduce inflammation, and restore physical balance. We use one of the only medical grade strength devices in the industry.",
    icon: "🧲"
  },
  {
    id: "nmr",
    title: "Neuromuscular Reeducation (NMR)",
    description: "One session per week of Neuromuscular Reeducation, designed to reset the nervous system, improve mobility, and address chronic or acute pain through precise nerve activation and feedback.",
    icon: "🧠"
  },
  {
    id: "nutrition",
    title: "Personalized Nutrition & Metabolic Optimization",
    description: "Complete metabolic assessment including VO₂ Max testing, resting metabolic rate analysis, personalized nutrition plan, and expert consultation for optimal performance.",
    icon: "🥗"
  }
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

export default function HipHopBookingPage() {
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<HipHopBookingData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HipHopBookingData>({
    resolver: zodResolver(hipHopBookingSchema),
  });

  const selectedServices = watch("services") || [];
  const selectedServiceObjects = services.filter(s => selectedServices.includes(s.id as any));

  const onSubmit = async (data: HipHopBookingData) => {
    setIsSubmitting(true);
    
    try {
      // Submit to API endpoint
      const response = await fetch('/api/hip-hop-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          services: data.services,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          notes: data.notes || '',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Error saving booking:', result.error);
        alert('There was an error submitting your booking. Please try again.');
        return;
      }

      console.log('Hip Hop booking saved successfully:', result.data);
      setBookingDetails(data);
      setBookingComplete(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingComplete && bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Header currentPage="hiphop" />
        
        <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold mb-4">
                🎉 Booking Request Submitted!
              </h2>
              
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                <strong>Congratulations on your Hip Hop nomination!</strong><br/>
                Thank you for choosing our wellness services. We'll contact you within 24 hours to confirm your appointment.
              </p>
            </div>

            {/* Content section */}
            <div className="p-8">
              {/* Booking Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 p-8 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Booking Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{bookingDetails.firstName} {bookingDetails.lastName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
                      <p className="text-lg text-gray-900 dark:text-white">{bookingDetails.email}</p>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Preferred Date</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{format(new Date(bookingDetails.preferredDate), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Preferred Time</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{bookingDetails.preferredTime}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Services */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 block">Selected Wellness Services</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedServiceObjects.map((service) => (
                      <div key={service.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{service.icon}</span>
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm leading-tight">{service.title}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-8 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100">Contact Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📍 Location</h5>
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>Midtown Biohack</strong><br/>
                      575 Madison Ave, 23rd floor<br/>
                      New York, NY
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💬 Contact</h5>
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>Billy Duc</strong><br/>
                      Email: billydduc@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 mb-8 border border-green-200 dark:border-green-700">
                <h4 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center">
                  <span className="mr-3">✨</span>
                  What Happens Next?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                      <p className="text-green-800 dark:text-green-200">We'll review your request within 24 hours</p>
                    </div>
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                      <p className="text-green-800 dark:text-green-200">Billy will contact you to confirm your appointment</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                      <p className="text-green-800 dark:text-green-200">You'll receive final details via email</p>
                    </div>
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                      <p className="text-green-800 dark:text-green-200">Arrive 15 minutes early for your session</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  🏠 Return to Home
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="hiphop" />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <video
              width={400}
              height={300}
              className="rounded-lg shadow-lg"
              controls
              autoPlay
              muted
              loop
            >
              <source src="/hiphop.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Dear Hip Hop Nominees,
          </h1>
          
          <div className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              <strong>Congratulations on your nomination! 🎉</strong> As part of this exciting time, 
              Wellnex02 and Midtown Biohack are pleased to extend an exclusive wellness offer to you.
            </p>
            
            <p>
              We invite you to take advantage of our advanced health and wellness services—designed 
              to help you recharge, recover, and perform at your best.
            </p>
            
            <p className="text-blue-600 dark:text-blue-400 font-semibold">
              👉 Book your session below and begin your journey toward peak health and well-being with us:
            </p>
            
            <div className="my-8">
              <button
                onClick={() => {
                  const bookingForm = document.getElementById('booking-form');
                  bookingForm?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse"
              >
                🎤 Book Your Wellness Session Now
              </button>
            </div>
            
            <p className="text-sm">
              We look forward to supporting your wellness journey.
            </p>
            
            <p className="font-medium">
              Best regards,<br/>
              <span className="text-blue-600 dark:text-blue-400">Wellnex02 & Midtown Biohack</span>
            </p>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Our Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div id="booking-form" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Book Your Wellness Session
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  {...register("firstName")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  {...register("lastName")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Services * (You can choose multiple)
              </label>
              <div className="grid grid-cols-1 gap-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedServices.includes(service.id as any)
                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                        : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={service.id}
                      {...register("services")}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="text-2xl mr-3">{service.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        selectedServices.includes(service.id as any)
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {service.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.services && (
                <p className="text-red-600 text-sm mt-1">{errors.services.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  {...register("preferredDate")}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {errors.preferredDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.preferredDate.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Time *
                </label>
                <select
                  {...register("preferredTime")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.preferredTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.preferredTime.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Any special requests or questions..."
              />
            </div>

            {/* Submit Button */}
            <div className="text-center mt-8 mb-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-16 py-5 rounded-lg font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-500 border-2 border-blue-700"
              >
                {isSubmitting ? "🔄 Submitting Your Booking..." : "🎤 BOOK NOW - FREE SESSION"}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
                ✨ Free for Hip Hop nominees • Confirmation emails will be sent
              </p>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}