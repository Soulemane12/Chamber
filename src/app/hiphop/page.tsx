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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Header currentPage="hiphop" />
        
        <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Booking Request Submitted! 🎉
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your interest in our wellness services. We'll contact you within 24 hours to confirm your appointment.
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">Your Booking Details</h3>
              <div className="text-left space-y-2">
                <p><strong>Name:</strong> {bookingDetails.firstName} {bookingDetails.lastName}</p>
                <p><strong>Email:</strong> {bookingDetails.email}</p>
                <div>
                  <p><strong>Selected Services:</strong></p>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    {selectedServiceObjects.map((service) => (
                      <li key={service.id} className="text-sm">{service.title}</li>
                    ))}
                  </ul>
                </div>
                <p><strong>Preferred Date:</strong> {format(new Date(bookingDetails.preferredDate), 'MMMM d, yyyy')}</p>
                <p><strong>Preferred Time:</strong> {bookingDetails.preferredTime}</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Contact Information</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Midtown Biohack</strong><br/>
                575 Madison Ave, 23rd floor, New York, NY<br/>
                Email: b.duc@wellnex02.com
              </p>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Return to Home
            </Button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
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
            
            <p className="text-purple-600 dark:text-purple-400 font-semibold">
              👉 Book your session below and begin your journey toward peak health and well-being with us:
            </p>
            
            <p className="text-sm">
              We look forward to supporting your wellness journey.
            </p>
            
            <p className="font-medium">
              Best regards,<br/>
              <span className="text-purple-600 dark:text-purple-400">Wellnex02 & Midtown Biohack</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                        ? "bg-purple-50 border-purple-500 dark:bg-purple-900/30 dark:border-purple-400"
                        : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={service.id}
                      {...register("services")}
                      className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="text-2xl mr-3">{service.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        selectedServices.includes(service.id as any)
                          ? "text-purple-600 dark:text-purple-400"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Any special requests or questions..."
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Book My Session"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}