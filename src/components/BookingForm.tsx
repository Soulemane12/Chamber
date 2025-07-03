"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

// Define the form schema with zod validation
const bookingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  date: z.date({
    required_error: "Please select a date",
    invalid_type_error: "Please select a valid date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  duration: z.enum(["60", "90", "120"], {
    required_error: "Please select a duration",
  }),
  location: z.enum(["midtown", "conyers"], {
    required_error: "Please select a location",
  }),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Simulated time slots
const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

// Pricing for different durations
const pricingOptions = {
  "60": 150,
  "90": 200,
  "120": 250,
};

interface BookingFormProps {
  onBookingComplete: (data: BookingFormData) => void;
}

export function BookingForm({ onBookingComplete }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
      duration: "60",
      location: "midtown",
    },
  });

  const selectedDate = watch("date");
  const selectedDuration = watch("duration");

  const calculateTotal = () => {
    return pricingOptions[selectedDuration as keyof typeof pricingOptions] || 0;
  };

  const isDateDisabled = (date: Date) => {
    // Example: Disable past dates and dates more than 30 days in the future
    const today = startOfDay(new Date());
    const thirtyDaysFromNow = addDays(today, 30);
    return isBefore(date, today) || isAfter(date, thirtyDaysFromNow);
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call to book session
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Send confirmation email - wrap this in a try/catch to prevent it from blocking the booking completion
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        const emailResult = await emailResponse.json();
        if (!emailResult.success) {
          console.error('Failed to send confirmation email:', emailResult.message);
          // Still continue with booking even if email fails
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue with booking even if email fails
      }
      
      // Complete booking regardless of email success
      onBookingComplete(data);
    } catch (error) {
      console.error("Booking failed", error);
      alert("There was an error processing your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // For step 1, validate personal details before proceeding
    if (currentStep === 1) {
      const { firstName, lastName, email, phone } = watch();
      
      // Trigger validation for these fields
      const isValid = [firstName, lastName, email, phone].every(field => field && field.length > 0);
      
      if (!isValid) {
        // Trigger validation to show error messages
        handleSubmit(() => {})();
        return;
      }
    }
    
    // For step 2, validate date, time, and location before proceeding
    if (currentStep === 2) {
      const { date, time, location } = watch();
      
      if (!date || !time || !location) {
        // Trigger validation to show error messages
        handleSubmit(() => {})();
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-scale-in">
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-4 text-center transition-all-300 text-xs sm:text-sm md:text-base ${
            currentStep === 1
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
          disabled={currentStep === 1}
        >
          <span className="block sm:hidden">1. Details</span>
          <span className="hidden sm:block">1. Personal Details</span>
        </button>
        <button
          className={`flex-1 py-4 text-center transition-all-300 text-xs sm:text-sm md:text-base ${
            currentStep === 2
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
          disabled={currentStep === 2}
        >
          <span className="block sm:hidden">2. Date/Time</span>
          <span className="hidden sm:block">2. Select Date & Time</span>
        </button>
        <button
          className={`flex-1 py-4 text-center transition-all-300 text-xs sm:text-sm md:text-base ${
            currentStep === 3
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
          disabled={currentStep === 3}
        >
          <span className="block sm:hidden">3. Payment</span>
          <span className="hidden sm:block">3. Payment</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Book Your Hyperbaric Chamber Session
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Fill out the form below to schedule your hyperbaric oxygen therapy session at one of Billy Duc&apos;s premium wellness centers.
          </p>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-slide-in-left animate-delay-100">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  {...register("firstName")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
                )}
              </div>
              <div className="animate-slide-in-right animate-delay-200">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  {...register("lastName")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="animate-slide-in-left animate-delay-300">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                {...register("email")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="animate-slide-in-right animate-delay-400">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                required
                {...register("phone")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
              )}
            </div>

                          <div className="pt-4 flex flex-col space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">* Required fields</p>
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Next Step
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="md:w-7/12">
                <DatePickerField
                  name="date"
                  label="Select Date *"
                  control={control}
                  error={errors.date?.message}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 30)}
                  filterDate={(date) => !isDateDisabled(date)}
                  inline
                  wrapperClassName="max-w-full animate-fade-in"
                />
              </div>
              
              <div className="mt-6 md:mt-0 md:w-5/12">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 h-full animate-slide-in-right animate-delay-200">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Time *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <label
                        key={time}
                        className={`
                          relative flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer
                          ${
                            watch("time") === time
                              ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                              : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={time}
                          {...register("time")}
                          className="sr-only"
                        />
                        <span 
                          className={`text-sm ${
                            watch("time") === time
                              ? "text-blue-600 dark:text-blue-400 font-medium"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {time}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="animate-slide-in-up animate-delay-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <label
                  className={`
                    relative flex items-center p-4 border rounded-lg cursor-pointer transition-all-300
                    ${
                      watch("location") === "midtown"
                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                        : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    value="midtown"
                    {...register("location")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      watch("location") === "midtown"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      Midtown Biohack
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">575 Madison Ave, 20th floor, NY, NY</p>
                  </div>
                </label>

                <label
                  className={`
                    relative flex items-center p-4 border rounded-lg cursor-pointer transition-all-300
                    ${
                      watch("location") === "conyers"
                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                        : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    value="conyers"
                    {...register("location")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      watch("location") === "conyers"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      Platinum Wellness Spa
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">1900 Parker Rd SE, Conyers, GA 30094</p>
                  </div>
                </label>
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
              )}
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session Duration *
              </label>
              <div className="space-y-3">
                <label
                  className={`
                    relative flex items-center p-4 border rounded-lg cursor-pointer
                    ${
                      watch("duration") === "60"
                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                        : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    value="60"
                    {...register("duration")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      watch("duration") === "60"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      60 Minute Session
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Standard session</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    watch("duration") === "60"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {formatCurrency(150)}
                  </div>
                </label>

                <label
                  className={`
                    relative flex items-center p-4 border rounded-lg cursor-pointer
                    ${
                      watch("duration") === "90"
                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                        : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    value="90"
                    {...register("duration")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      watch("duration") === "90"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      90 Minute Session
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Extended session</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    watch("duration") === "90"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {formatCurrency(200)}
                  </div>
                </label>

                <label
                  className={`
                    relative flex items-center p-4 border rounded-lg cursor-pointer
                    ${
                      watch("duration") === "120"
                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                        : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    value="120"
                    {...register("duration")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      watch("duration") === "120"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      120 Minute Session
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Premium session</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    watch("duration") === "120"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {formatCurrency(250)}
                  </div>
                </label>
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration.message}</p>
              )}
            </div>

            <div className="animate-slide-in-up animate-delay-400">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                id="notes"
                {...register("notes")}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                type="button" 
                onClick={prevStep}
                variant="outline"
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={nextStep}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 animate-scale-in">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Booking Summary</h3>
              {selectedDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(selectedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">{watch("time")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{watch("duration")} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {watch("location") === "midtown" ? "Midtown Biohack" : "Platinum Wellness Spa"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {watch("location") === "midtown" 
                        ? "575 Madison Ave, 20th floor, New York, NY" 
                        : "1900 Parker Rd SE, Conyers, GA 30094"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 animate-slide-in-up animate-delay-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      id="expDate"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    id="nameOnCard"
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                type="button" 
                onClick={prevStep}
                variant="outline"
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back
              </Button>
              <Button 
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                isLoading={isSubmitting}
                size="lg"
                className="w-full sm:w-auto order-1 sm:order-2"
                disabled={isSubmitting}
              >
                <span className="hidden sm:inline">{`Complete Booking • ${formatCurrency(calculateTotal())}`}</span>
                <span className="sm:hidden">{`Book • ${formatCurrency(calculateTotal())}`}</span>
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 