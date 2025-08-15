"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";

// Define the assessment form schema with zod validation
const assessmentSchema = z.object({
  date: z.string().min(1, "Date is required"),
  hour: z.string().min(1, "Hour is required"),
  minutes: z.string().min(1, "Minutes is required"),
  ampm: z.enum(["AM", "PM"], {
    required_error: "Please select AM or PM",
  }),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  painLevel: z.number().min(0).max(10, "Pain level must be between 0 and 10"),
  stressLevel: z.number().min(0).max(10, "Stress level must be between 0 and 10"),
  focusLevel: z.number().min(0).max(10, "Focus level must be between 0 and 10"),
  happinessLevel: z.number().min(0).max(10, "Happiness level must be between 0 and 10"),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  onAssessmentComplete?: (data: AssessmentFormData) => void;
  bookingId?: string;
}

export function AssessmentForm({ onAssessmentComplete, bookingId }: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      hour: "12",
      minutes: "00",
      ampm: "PM",
      painLevel: 5,
      stressLevel: 5,
      focusLevel: 5,
      happinessLevel: 5,
    },
  });

  const watchedPainLevel = watch("painLevel");
  const watchedStressLevel = watch("stressLevel");
  const watchedFocusLevel = watch("focusLevel");
  const watchedHappinessLevel = watch("happinessLevel");

  const onSubmit = async (data: AssessmentFormData) => {
    setIsSubmitting(true);
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prepare the assessment data
      const assessmentData = {
        user_id: session?.user?.id || null,
        booking_id: bookingId || null,
        assessment_date: data.date,
        assessment_time: `${data.hour}:${data.minutes} ${data.ampm}`,
        first_name: data.firstName,
        last_name: data.lastName,
        pain_level: data.painLevel,
        stress_level: data.stressLevel,
        focus_level: data.focusLevel,
        happiness_level: data.happinessLevel,
        created_at: new Date().toISOString(),
      };

      // Insert the assessment data into the database
      const { error } = await supabase
        .from('assessments')
        .insert([assessmentData]);

      if (error) {
        console.error('Error saving assessment:', error);
        throw error;
      }

      setSubmitSuccess(true);
      if (onAssessmentComplete) {
        onAssessmentComplete(data);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('There was an error submitting your assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Assessment Submitted Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for completing your self-assessment. Your responses have been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Self Assessment Log
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Please complete this assessment to track your wellness journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date and Time Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date*
            </label>
            <input
              type="date"
              {...register("date")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hour
            </label>
            <select
              {...register("hour")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <option key={hour} value={hour.toString().padStart(2, '0')}>
                  {hour}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minutes
            </label>
            <select
              {...register("minutes")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                <option key={minute} value={minute.toString().padStart(2, '0')}>
                  {minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AM/PM
            </label>
            <select
              {...register("ampm")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Name Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name*
            </label>
            <input
              type="text"
              {...register("firstName")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name*
            </label>
            <input
              type="text"
              {...register("lastName")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Assessment Questions */}
        <div className="space-y-6">
          {/* Pain Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What is your overall pain level today? 0 being no pain, 10 being the worst.
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                {...register("painLevel", { valueAsNumber: true })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0 (No Pain)</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{watchedPainLevel}</span>
                <span>10 (Worst Pain)</span>
              </div>
            </div>
            {errors.painLevel && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.painLevel.message}</p>
            )}
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What is your overall stress level today? 0 being no stress, 10 being the highest level of stress imaginable.
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                {...register("stressLevel", { valueAsNumber: true })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0 (No Stress)</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{watchedStressLevel}</span>
                <span>10 (Highest Stress)</span>
              </div>
            </div>
            {errors.stressLevel && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stressLevel.message}</p>
            )}
          </div>

          {/* Focus Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How would you rate your level of focus today? 0 being not focused at all, 10 being the most focused you have ever felt.
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                {...register("focusLevel", { valueAsNumber: true })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0 (Not Focused)</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{watchedFocusLevel}</span>
                <span>10 (Most Focused)</span>
              </div>
            </div>
            {errors.focusLevel && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.focusLevel.message}</p>
            )}
          </div>

          {/* Happiness Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How would you rate your level of happiness? 0 being not happy at all, 10 being extremely happy.
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                {...register("happinessLevel", { valueAsNumber: true })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0 (Not Happy)</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{watchedHappinessLevel}</span>
                <span>10 (Extremely Happy)</span>
              </div>
            </div>
            {errors.happinessLevel && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.happinessLevel.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit Assessment"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
