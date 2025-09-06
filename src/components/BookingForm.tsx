"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isBefore, startOfDay } from "date-fns";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Button } from "@/components/ui/Button";
import { formatCurrency, getLocationData, isPromotionActive, getPromotionPricing, promotionConfig } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { FileUpload } from "@/components/ui/FileUpload";

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
  duration: z.enum(["20", "45", "60", "90", "120"], {
    required_error: "Please select a duration",
  }),
  location: z.enum(["midtown", "conyers"], {
    required_error: "Please select a location",
  }),
  groupSize: z.enum(["1", "2", "3", "4"]),
  notes: z.string().optional(),
  bookingReason: z.string().optional(),
  // Make demographic fields required for guest users, the form component will conditionally validate
  gender: z.string().min(1, "Please select your gender"),
  race: z.string().min(1, "Please select your race/ethnicity"),
  education: z.string().min(1, "Please select your education level"),
  profession: z.string().min(1, "Please select your profession"),
  age: z.string().min(1, "Please select your age range"),
  // Add field for uploaded files
  uploadedFiles: z.array(z.any()).optional()
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

// Group size multipliers (discount for groups)
const groupSizeMultipliers = {
  "1": 1.0,    // No discount for single guest
  "2": 1.8,    // 10% discount per guest
  "3": 2.55,   // 15% discount per guest
  "4": 3.2,    // 20% discount per guest
};

interface BookingFormProps {
  onBookingComplete: (data: BookingFormData) => void;
  isAuthenticated: boolean;
}

export function BookingForm({ onBookingComplete, isAuthenticated }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender?: string;
    race?: string;
    education?: string;
    profession?: string;
    age?: string;
  } | null>(null);
  
  const [isGuest, setIsGuest] = useState(!isAuthenticated);

  // Add loading state for step transitions
  const [isStepLoading, setIsStepLoading] = useState(false);

  // Update step definitions - Remove seating step
  const isPersonalInfoStep = isGuest && currentStep === 1;
  const isLocationStep = isGuest ? currentStep === 2 : currentStep === 1;
  const isBookingDetailsStep = isGuest ? currentStep === 3 : currentStep === 2;
  const isPaymentStep = isGuest ? currentStep === 4 : currentStep === 3; // One less step now

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
      bookingReason: "",
      duration: "60",
      location: "midtown",
      groupSize: "1",
      uploadedFiles: []
    },
  });

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    setValue('uploadedFiles', files);
  };

  // Add a new function to handle group size changes
  const handleGroupSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = e.target.value as "1" | "2" | "3" | "4";
    setValue('groupSize', newSize);
  };

  // Fetch user profile on component mount (only if authenticated)
  useEffect(() => {
    async function fetchUserProfile() {
      if (!isAuthenticated) {
        setIsLoading(false);
        setIsGuest(true);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user details from auth
          const { data: userAuth } = await supabase.auth.getUser();
          
          // Get profile from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            // Split full name into first and last name (basic approach)
            const nameParts = profileData.full_name ? profileData.full_name.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            // Calculate age from DOB if available
            let calculatedAge: string | undefined = undefined;
            if (profileData.dob) {
              const dob = new Date(profileData.dob);
              if (!isNaN(dob.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                
                // Adjust age if birthday hasn't occurred this year yet
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                  age--;
                }
                
                calculatedAge = String(age);
              }
            }
            
            // Set form values
            setValue('firstName', firstName);
            setValue('lastName', lastName);
            setValue('email', profileData.email || userAuth?.user?.email || '');
            setValue('phone', profileData.phone || '');
            
            // Set demographic information from profile
            if (profileData.gender) setValue('gender', profileData.gender);
            if (profileData.race) setValue('race', profileData.race);
            if (profileData.education) setValue('education', profileData.education);
            if (profileData.profession) setValue('profession', profileData.profession);
            if (calculatedAge) setValue('age', calculatedAge);
            
            setUserProfile({
              firstName,
              lastName,
              email: profileData.email || userAuth?.user?.email || '',
              phone: profileData.phone || '',
              gender: profileData.gender,
              race: profileData.race,
              education: profileData.education,
              profession: profileData.profession,
              age: calculatedAge || undefined
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [setValue, isAuthenticated]);

  const selectedDate = watch("date");
  const selectedDuration = watch("duration");
  const selectedGroupSize = watch("groupSize");
  const selectedLocation = watch("location");

  const calculateTotal = () => {
    // Check if promotion is active for the selected location and date
    const isPromoActive = selectedDate && selectedLocation ? isPromotionActive(selectedLocation, selectedDate) : false;
    
    let basePrice: number;
    if (isPromoActive) {
      // Use promotion pricing for 20, 45, 60 minutes during promotion
      const promoPrice = getPromotionPricing(selectedDuration);
      basePrice = promoPrice !== null ? promoPrice : (pricingOptions[selectedDuration as keyof typeof pricingOptions] || 0);
      // No group discounts during promotion - return flat promotion price
      return basePrice;
    } else {
      // Regular pricing only for 60, 90, 120 minutes
      basePrice = pricingOptions[selectedDuration as keyof typeof pricingOptions] || 0;
      // Apply group discounts for regular pricing
      const multiplier = groupSizeMultipliers[selectedGroupSize as keyof typeof groupSizeMultipliers] || 1.0;
      return basePrice * multiplier;
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates only; allow any future date
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Calculate booking amount
      const isPromoActive = isPromotionActive(data.location, data.date);
      let amount: number;
      if (isPromoActive) {
        // Use promotion pricing for 20, 45, 60 minutes during promotion
        const promoPrice = getPromotionPricing(data.duration);
        amount = promoPrice !== null ? promoPrice : (pricingOptions[data.duration as keyof typeof pricingOptions] || 0);
        // No group discounts during promotion - use flat promotion price
      } else {
        // Regular pricing only for 60, 90, 120 minutes
        const basePrice = pricingOptions[data.duration as keyof typeof pricingOptions] || 0;
        // Apply group discounts for regular pricing
        const multiplier = groupSizeMultipliers[data.groupSize as keyof typeof groupSizeMultipliers] || 1.0;
        amount = basePrice * multiplier;
      }
      
      // Get user ID if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Basic booking data with only essential fields
      const bookingData: {
        user_id: string | undefined;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        date: string;
        time: string;
        duration: string;
        location: string;
        group_size: number;
        amount: number;
        created_at: string;
        // Optional fields
        gender?: string | null;
        race?: string | null;
        education?: string | null;
        profession?: string | null;
        age?: string | null;
        notes?: string | null;
        booking_reason?: string | null;
      } = {
        user_id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        date: data.date.toISOString().split('T')[0],
        time: data.time,
        duration: data.duration,
        location: data.location,
        group_size: parseInt(data.groupSize),
        amount,
        // Include demographic information from form or profile, with defensive checks
        // to avoid errors if columns don't exist yet
        created_at: new Date().toISOString(),
        // Set optional fields
        gender: data.gender || null,
        race: data.race || null,
        education: data.education || null,
        profession: data.profession || null,
        age: data.age || null,
        notes: data.notes || null,
        booking_reason: data.bookingReason || null
      };
      
      // Remove any undefined properties to avoid database errors
      try {
        // Clean the object by removing any undefined values before sending to the API
        Object.keys(bookingData).forEach(key => {
          if (bookingData[key as keyof typeof bookingData] === undefined) {
            delete bookingData[key as keyof typeof bookingData];
          }
        });
      } catch (e) {
        console.warn("Warning: Error cleaning booking data", e);
      }
      
      console.log('Booking data being submitted:', bookingData);

      // Save booking to database with error handling
      let result, error;
      try {
        const response = await supabase
          .from('bookings')
          .insert([bookingData])
          .select();
          
        result = response.data;
        error = response.error;
        
        console.log('Supabase response:', { result, error });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        // If there are files to upload, upload them
        if (uploadedFiles.length > 0 && result && result[0]?.id) {
          const bookingId = result[0].id;
          
          try {
            for (const file of uploadedFiles) {
              const fileExt = file.name.split('.').pop();
              const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
              const filePath = `${bookingId}/${fileName}`;
              
              const { error: uploadError } = await supabase
                .storage
                .from('booking-documents')
                .upload(filePath, file);
                
              if (uploadError) {
                console.error('Error uploading file:', uploadError);
              }
            }
          } catch (uploadErr) {
            console.error('File upload error:', uploadErr);
            // Continue with booking even if file upload fails
          }
        }
        
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error in booking submission:', {
          error: err,
          message: errorMessage,
          errorString: String(err),
          errorObject: err ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : 'No error object',
          bookingData: JSON.stringify(bookingData, null, 2)
        });

        // Check if it's a specific column not found error
        if (err instanceof Error && 
            err.message.includes('column') && 
            err.message.includes('not found')) {
          // Try running the migration and retry
          try {
            // Try to run the migration first
            const migrationResponse = await fetch('/api/admin/migrate-seat-selection');
            if (migrationResponse.ok) {
              console.log('Migration completed, retrying booking submission');
              // Retry the booking submission
              const retryResponse = await supabase
                .from('bookings')
                .insert([bookingData])
                .select();
                
              result = retryResponse.data;
              error = retryResponse.error;
              
              if (error) throw error;
            } else {
              throw new Error('Migration failed');
            }
          } catch (migrationErr) {
            console.error('Migration attempt failed:', migrationErr);
            throw new Error('Failed to save your booking. Please try again later.');
          }
        } else {
          throw new Error(errorMessage || 'Failed to save your booking');
        }
      }
      
      console.log('Booking saved successfully:', result);
      
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

  // Update the nextStep function to show loading
  const nextStep = async () => {
    // Validate current step before proceeding
    let isValid = true;
    
    setIsStepLoading(true);
    
    try {
      if (isPersonalInfoStep) {
        // Validate personal info for guest users
        isValid = await trigger([
          "firstName", 
          "lastName", 
          "email", 
          "phone", 
          "gender", 
          "age", 
          "race", 
          "education", 
          "profession"
        ]);
      } else if (isLocationStep) {
        // Validate location
        isValid = await trigger(["location"]);
      } else if (isBookingDetailsStep) {
        // Validate booking details
        isValid = await trigger(["date", "time", "duration"]);
      }
      
      if (!isValid) {
        setIsStepLoading(false);
        return;
      }
      
      // Add small artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentStep((prev) => prev + 1);
      
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error navigating to next step:", error);
    } finally {
      setIsStepLoading(false);
    }
  };

  // Update the prevStep function to show loading
  const prevStep = async () => {
    setIsStepLoading(true);
    
    try {
      // Add small artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentStep(currentStep - 1);
      
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error navigating to previous step:", error);
    } finally {
      setIsStepLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-8 animate-pulse">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your booking form</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Retrieving your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-scale-in relative">
      {/* Loading overlay for step transitions */}
      {isStepLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        {/* Mobile step indicator */}
        <div className="flex sm:hidden justify-center py-3">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, ...(isGuest ? [4] : [])].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : step < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < (isGuest ? 4 : 3) && (
                  <div
                    className={`w-6 h-0.5 mx-1 ${
                      step < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop step navigation */}
        <div className="hidden sm:flex flex-wrap">
          <button
            className={`flex-1 py-4 text-center transition-all-300 text-sm md:text-base ${
              currentStep === 1
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-500 dark:text-gray-400"
            }`}
            disabled={currentStep === 1}
            type="button"
          >
            <span className="block">1. {isGuest ? "Your Information" : "Select Location"}</span>
          </button>
          <button
            className={`flex-1 py-4 text-center transition-all-300 text-sm md:text-base ${
              currentStep === 2
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-500 dark:text-gray-400"
            } ${isGuest && currentStep < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isGuest && currentStep < 2}
            type="button"
          >
            <span className="block">2. {isGuest ? "Select Location" : "Booking Details"}</span>
          </button>
          <button
            className={`flex-1 py-4 text-center transition-all-300 text-sm md:text-base ${
              currentStep === 3
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-500 dark:text-gray-400"
            } ${currentStep < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentStep < 3}
            type="button"
          >
            <span className="block">3. {isGuest ? "Booking Details" : "Payment"}</span>
          </button>
          {isGuest && (
            <button
              className={`flex-1 py-4 text-center transition-all-300 text-sm md:text-base ${
                currentStep === 4
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              } ${currentStep < 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={currentStep < 4}
              type="button"
            >
              <span className="block">4. Payment</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Book Your Hyperbaric Chamber Session
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Fill out the form below to schedule your hyperbaric oxygen therapy session at one of our premium wellness centers.
          </p>
          
          {isGuest && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-200">
                You&apos;re booking as a guest. Your information will only be used for this booking.
              </p>
            </div>
          )}
          
          {userProfile && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Booking as: <span className="font-medium">{userProfile.firstName} {userProfile.lastName}</span> ({userProfile.email})
              </p>
            </div>
          )}
        </div>

        {/* Personal Information Step - Only for guests */}
        {isPersonalInfoStep && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Your Information</h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    {...register("firstName")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    {...register("lastName")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              
              {/* Demographic Information Section - Added for guests */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Demographic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      {...register("gender")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non_binary">Non-binary</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age Range *
                    </label>
                    <select
                      id="age"
                      {...register("age")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select your age range</option>
                      <option value="18">18-24</option>
                      <option value="25">25-34</option>
                      <option value="35">35-44</option>
                      <option value="45">45-54</option>
                      <option value="55">55-64</option>
                      <option value="65">65+</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.age.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="race" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Race/Ethnicity *
                    </label>
                    <select
                      id="race"
                      {...register("race")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select your race/ethnicity</option>
                      <option value="asian">Asian</option>
                      <option value="black">Black or African American</option>
                      <option value="hispanic">Hispanic or Latino</option>
                      <option value="white">White</option>
                      <option value="native">Native American or Alaskan Native</option>
                      <option value="pacific">Native Hawaiian or Pacific Islander</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {errors.race && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.race.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Education Level *
                    </label>
                    <select
                      id="education"
                      {...register("education")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select your education level</option>
                      <option value="high_school">High School or equivalent</option>
                      <option value="some_college">Some College</option>
                      <option value="associate">Associate's Degree</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="doctorate">Doctorate or higher</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {errors.education && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.education.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="profession" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Profession *
                    </label>
                    <select
                      id="profession"
                      {...register("profession")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select your profession</option>
                      <option value="healthcare">Healthcare Professional</option>
                      <option value="education">Education Professional</option>
                      <option value="technology">Technology Professional</option>
                      <option value="finance">Finance Professional</option>
                      <option value="legal">Legal Professional</option>
                      <option value="engineering">Engineering Professional</option>
                      <option value="business">Business Professional</option>
                      <option value="service">Service Professional</option>
                      <option value="arts">Arts and Entertainment</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {errors.profession && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.profession.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Add the file upload component */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <FileUpload 
                  onFileUpload={handleFileUpload}
                  label="Upload Documents (Optional)"
                  description="Upload JotForms or other supporting documents"
                />
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button
                  type="button"
                  onClick={nextStep}
                  isLoading={isStepLoading}
                  className="w-full sm:w-auto"
                >
                  Continue to Booking Details
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Location Selection Step */}
        {isLocationStep && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Select Location</h2>

            {isGuest && (
              <div className="space-y-4 animate-slide-in-up">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Booking as: {watch('firstName')} {watch('lastName')}</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{watch('email')} • {watch('phone')}</p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
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
              
              {/* Location-specific information section */}
              {watch("location") && (
                <div className="mt-6 mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800 animate-fade-in">
                  <h3 className="font-medium text-lg text-blue-800 dark:text-blue-300 mb-2">
                    {getLocationData(watch("location"))?.name} Information
                  </h3>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {getLocationData(watch("location"))?.description}
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {getLocationData(watch("location"))?.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
                      Note: {getLocationData(watch("location"))?.note}
                    </p>
                  </div>

                  {/* Business Hours Section */}
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Business Hours</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Monday:</span>
                        <span className="text-gray-600 dark:text-gray-400">{getLocationData(watch("location"))?.hours.monday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Tuesday:</span>
                        <span className="text-gray-600 dark:text-gray-400">{getLocationData(watch("location"))?.hours.tuesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Wednesday:</span>
                        <span className="text-gray-600 dark:text-gray-400">{getLocationData(watch("location"))?.hours.wednesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Thursday:</span>
                        <span className="text-gray-600 dark:text-gray-400">{getLocationData(watch("location"))?.hours.thursday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Friday:</span>
                        <span className="text-gray-600 dark:text-gray-400">{getLocationData(watch("location"))?.hours.friday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Saturday:</span>
                        <span className="text-gray-600 dark:text-gray-400">{getLocationData(watch("location"))?.hours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Sunday:</span>
                        <span className="text-gray-600 dark:text-gray-400">{getLocationData(watch("location"))?.hours.sunday}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add an image of the location */}
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img 
                      src={getLocationData(watch("location"))?.imageUrl}
                      alt={`${getLocationData(watch("location"))?.name} facility`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                {isGuest && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    isLoading={isStepLoading}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={nextStep}
                  isLoading={isStepLoading}
                  className={`w-full sm:w-auto ${isGuest ? 'sm:ml-auto order-1 sm:order-2' : ''}`}
                  disabled={!watch("location") || isStepLoading}
                >
                  Continue to Booking Details
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Booking Details Step */}
        {isBookingDetailsStep && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {isGuest && (
              <div className="space-y-4 animate-slide-in-up">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Booking as: {watch('firstName')} {watch('lastName')}</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{watch('email')} • {watch('phone')}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Selected Location: {getLocationData(watch("location"))?.name}</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{getLocationData(watch("location"))?.address}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-6">
              <div className="lg:w-7/12 mb-6 lg:mb-0">
                <DatePickerField
                  name="date"
                  label="Select Date *"
                  control={control}
                  error={errors.date?.message}
                  minDate={new Date()}
                  filterDate={(date) => !isDateDisabled(date)}
                  inline
                  wrapperClassName="max-w-full animate-fade-in"
                />
              </div>

              <div className="lg:w-5/12">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700 h-full animate-slide-in-right animate-delay-200">
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
                Session Duration *
              </label>
              
              {/* Promotion Banner */}
              {selectedDate && selectedLocation && isPromotionActive(selectedLocation, selectedDate) && (
                <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🌟</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Special Promotion Active!</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">{promotionConfig.description}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {/* Show promotion durations when promotion is active */}
                {selectedDate && selectedLocation && isPromotionActive(selectedLocation, selectedDate) ? (
                  <>
                    {/* 20 Minute Session - FREE during promotion */}
                    <label
                      className={`
                        relative flex items-center p-4 border rounded-lg cursor-pointer
                        ${
                          watch("duration") === "20"
                            ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                            : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value="20"
                        {...register("duration")}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          watch("duration") === "20"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-900 dark:text-white"
                        }`}>
                          20 Minute Session
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Quick session</p>
                      </div>
                      <div className={`text-lg font-bold ${
                        watch("duration") === "20"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {formatCurrency(0)}
                        <span className="text-green-600 dark:text-green-400 ml-2">FREE!</span>
                      </div>
                    </label>

                    {/* 45 Minute Session - $75 during promotion */}
                    <label
                      className={`
                        relative flex items-center p-4 border rounded-lg cursor-pointer
                        ${
                          watch("duration") === "45"
                            ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                            : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value="45"
                        {...register("duration")}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          watch("duration") === "45"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-900 dark:text-white"
                        }`}>
                          45 Minute Session
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Extended session</p>
                      </div>
                      <div className={`text-lg font-bold ${
                        watch("duration") === "45"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {formatCurrency(75)}
                      </div>
                    </label>

                    {/* 60 Minute Session - $90 during promotion */}
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
                        {formatCurrency(90)}
                      </div>
                    </label>
                  </>
                ) : (
                  <>
                    {/* Regular durations when promotion is not active */}
                    {/* 60 Minute Session */}
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
                        {formatCurrency(pricingOptions["60"])}
                      </div>
                    </label>

                    {/* 90 Minute Session */}
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
                        {formatCurrency(pricingOptions["90"])}
                      </div>
                    </label>

                    {/* 120 Minute Session */}
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
                        {formatCurrency(pricingOptions["120"])}
                      </div>
                    </label>
                  </>
                )}

              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration.message}</p>
              )}
            </div>

            {/* Group Size Section - Hidden during promotion */}
            {!(selectedDate && selectedLocation && isPromotionActive(selectedLocation, selectedDate)) && (
              <div className="animate-slide-in-up animate-delay-300">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Group Size *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {["1", "2", "3", "4"].map((size) => (
                    <label
                      key={size}
                      className={`
                        relative flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
                        ${
                          watch("groupSize") === size
                            ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400 shadow-lg"
                            : "bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value={size}
                        {...register("groupSize")}
                        onChange={handleGroupSizeChange}
                        className="sr-only"
                      />
                      <span className={`text-3xl font-bold mb-1 ${
                        watch("groupSize") === size
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {size}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {size === "1" ? "Guest" : "Guests"}
                      </span>
                      {size !== "1" && (
                        <span className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">
                          {size === "2" ? "10%" : size === "3" ? "15%" : "20%"} discount
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="animate-slide-in-up animate-delay-500">
              <label htmlFor="bookingReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purpose of Visit (Optional)
              </label>
              <select
                id="bookingReason"
                {...register("bookingReason")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a reason (optional)</option>
                <option value="recovery">Recovery from injury/surgery</option>
                <option value="wellness">General wellness</option>
                <option value="performance">Athletic performance</option>
                <option value="chronic_condition">Chronic condition management</option>
                <option value="preventative">Preventative health</option>
                <option value="other">Other (specify in notes)</option>
              </select>
            </div>

            <div className="animate-slide-in-up animate-delay-600">
              {!isGuest && userProfile && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Demographic Information</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Using demographic information from your profile:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      {userProfile.gender && (
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender:</span>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                            {userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      )}
                      {userProfile.race && (
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Race/Ethnicity:</span>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                            {userProfile.race.charAt(0).toUpperCase() + userProfile.race.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      )}
                      {userProfile.education && (
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Education:</span>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                            {userProfile.education.split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </span>
                        </div>
                      )}
                      {userProfile.profession && (
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Profession:</span>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{userProfile.profession}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                id="notes"
                {...register("notes")}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Please share any additional information about your visit or specific health concerns."
              ></textarea>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                isLoading={isStepLoading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back to Location
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                isLoading={isStepLoading}
                className="w-full sm:w-auto sm:ml-auto order-1 sm:order-2"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}
        
        {/* Payment Step */}
        {isPaymentStep && (
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
                      {getLocationData(watch("location"))?.name}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getLocationData(watch("location"))?.address}
                    </p>
                  </div>
                  {watch("bookingReason") && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Purpose</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {watch("bookingReason") === "recovery" ? "Recovery from injury/surgery" :
                         watch("bookingReason") === "wellness" ? "General wellness" :
                         watch("bookingReason") === "performance" ? "Athletic performance" :
                         watch("bookingReason") === "chronic_condition" ? "Chronic condition management" :
                         watch("bookingReason") === "preventative" ? "Preventative health" :
                         watch("bookingReason") === "other" ? "Other" : ""}
                      </p>
                    </div>
                  )}
                  {!(selectedDate && selectedLocation && isPromotionActive(selectedLocation, selectedDate)) && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Group Size</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {watch("groupSize")} {parseInt(watch("groupSize")) > 1 ? "guests" : "guest"}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(calculateTotal())}</p>
                  </div>

                  {/* Show uploaded files if any */}
                  {uploadedFiles.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded Documents</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                      </p>
                    </div>
                  )}
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

            <div className="pt-4 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                isLoading={isStepLoading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || isStepLoading}
                size="lg"
                className="w-full sm:w-auto order-1 sm:order-2"
                disabled={isSubmitting || isStepLoading}
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