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
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  notes: z.string().optional(),
});

type HipHopBookingData = z.infer<typeof hipHopBookingSchema>;

const services = [
  {
    id: "neuromuscular-reset",
    title: "⚡ Neuromuscular Reset",
    description: "Re-train your nervous system to relieve pain, restore mobility, and speed recovery.",
    icon: "🧠"
  },
  {
    id: "oxygen-boost",
    title: "🌬️ Oxygen Boost (HBOT)",
    description: "Breathe pure oxygen under pressure to fuel cells, accelerate healing, and increase energy.",
    icon: "🫁"
  },
  {
    id: "red-light-therapy",
    title: "💡 Red Light Brain Therapy",
    description: "Clear brain fog, improve focus, and boost mental clarity.",
    icon: "💡"
  },
  {
    id: "electric-exercise",
    title: "💪 Electric Exercise",
    description: "20 minutes = 5,000 crunches. Build strength and tone without joint stress.",
    icon: "⚡"
  },
  {
    id: "stress-reset",
    title: "🧘 Stress Reset Protocol",
    description: "Shift from 'fight or flight' into deep calm and full-body recovery.",
    icon: "🧘‍♂️"
  },
  {
    id: "ifs-session",
    title: "🧩 IFS Session with Ty Cutner",
    description: "Use Internal Family Systems therapy to align mind, emotions, and identity — unlocking clarity, confidence, and deeper purpose.",
    icon: "🧩"
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
          service: "hip-hop-executive-recovery",
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
        <Header />
        
        <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-100 dark:bg-gray-700 px-8 py-12 text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                🎉 Executive Recovery Session Booked!
              </h2>
              
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                <br/>
                Thank you for booking your Executive Recovery Session. We'll contact you within 24 hours to confirm your appointment.
              </p>
            </div>

            {/* Content section */}
            <div className="p-8">
              {/* Booking Details Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-8 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {/* Booked Service */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 block">Booked Session</label>
                  <div className="bg-gray-100 dark:bg-gray-600 p-6 rounded-lg border border-gray-200 dark:border-gray-500">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">🎤</span>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">Executive Recovery Session</h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Complete 2.5-hour wellness experience with Dr. Chuck Morris</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 mb-8 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">📍 Location</h5>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Midtown Biohack</strong><br/>
                      575 Madison Ave, 23rd floor<br/>
                      New York, NY
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">💬 Contact</h5>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Billy Duc</strong><br/>
                      Email: b.duc@wellnex02.com
                      <br/>
                      Phone: 646-262-8794
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 mb-8 border border-gray-200 dark:border-gray-600">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-3">✨</span>
                  What Happens Next?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                      <p className="text-gray-700 dark:text-gray-300">We'll review your request within 24 hours</p>
                    </div>
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                      <p className="text-gray-700 dark:text-gray-300">Dr. Chuck Morris, Billy Duc & Ty Cutner will contact you to confirm your appointment</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                      <p className="text-gray-700 dark:text-gray-300">You'll receive final details via email</p>
                    </div>
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                      <p className="text-gray-700 dark:text-gray-300">Arrive 15 minutes early for your session</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button 
                  onClick={() => window.location.href = '/hiphop'}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-12 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
      <Header />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Dear Hip Hop Honorees,
          </h1>

          <div className="max-w-4xl mx-auto text-lg text-gray-600 dark:text-gray-300 space-y-6">
            <div className="p-8">
              <p className="text-xl text-gray-800 dark:text-gray-200 mb-4">
                <strong>Congratulations on being Honored by the Hip Hop Museum 🎉</strong> As part of this exciting time,
                Wellnex02 and Midtown Biohack are pleased to extend an exclusive complimentary wellness offer to you.
              </p>

              <p className="text-lg text-gray-700 dark:text-gray-300">
                We invite you to take advantage of our Executive Recovery session—designed
                to help you recharge, recover, and perform at your best.
              </p>
            </div>

            <div className="p-6">
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                🎁 Executive Recovery Session - Complimentary
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Duration: 2.5 Hours • Led by Dr. Chuck Morris
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Location: Midtown Biohack<br/>
                575 Madison Ave 23rd floor<br/>
                New York, NY 10022
              </p>
            </div>

            <div className="p-6">
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                🔑 Reset • Recharge • Perform
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                A luxury, science-based experience to help you feel years younger, sharpen your mind, and unlock peak performance — in just 2.5 hours.
              </p>
            </div>

            <div className="p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🌟 Why It Matters</h3>
              <p className="text-gray-700 dark:text-gray-300">
                This is not just recovery — it's a full-system reset. Designed to relieve pain, restore energy, elevate emotional wellness, and sharpen your mental edge so you perform at your highest level.
              </p>
            </div>

            <div className="my-8">
              <button
                onClick={() => {
                  const bookingForm = document.getElementById('booking-form');
                  bookingForm?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse"
              >
                🎤 Book Your Executive Recovery Session Now
              </button>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            🧠 What You'll Experience
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4 flex items-center gap-2">
                  {service.icon}
                  {service.id === "ifs-session" && (
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                      Optional
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          {/* Hip Hop Video Section */}
          <div className="my-12 text-center">
            <div className="flex justify-center">
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
          </div>
        </div>

        {/* Booking Form */}
        <div id="booking-form" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Book Your Executive Recovery Session
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
            <div style={{
              textAlign: 'center',
              padding: '30px 0',
              margin: '30px 0'
            }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: '2px solid #1d4ed8',
                  padding: '20px 64px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'block',
                  margin: '0 auto',
                  minWidth: '300px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSubmitting ? "🔄 Submitting Your Booking..." : "🎤 BOOK EXECUTIVE RECOVERY SESSION"}
              </button>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                marginTop: '12px',
                fontWeight: '500'
              }}>
                Confirmation emails will be sent
              </p>
            </div>
          </form>
        </div>

        {/* Value and Signature at Bottom */}
        <div className="mt-12 text-center">
          <div className="p-6">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💎 Value: $2,500.00 • 🎤 Gifted to: Honorees of the Hip Hop Museum
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              We look forward to supporting your wellness journey.
            </p>

            <p className="font-medium text-gray-900 dark:text-white">
              Best regards,<br/>
              <span className="text-blue-600 dark:text-blue-400">Dr. Chuck Morris, Billy Duc & Ty Cutner</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}