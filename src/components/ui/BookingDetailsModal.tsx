import { useState } from "react";

export interface GuestBookingInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  duration: number;
  group_size: number;
  location: string;
  amount: number;
  booking_reason?: string;
  notes?: string;
  gender?: string;
  race?: string;
  education?: string;
  profession?: string;
  age?: string | number;
  user_id?: string | null;
  created_at?: string;
}

interface BookingDetailsModalProps {
  booking: GuestBookingInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  if (!isOpen || !booking) {
    return null;
  }

  // Seat data has been removed from the application

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Format location for display
  const formatLocation = (loc: string) => {
    if (loc === 'midtown') return 'Midtown Biohack';
    if (loc === 'conyers') return 'Platinum Wellness Spa';
    return loc.charAt(0).toUpperCase() + loc.slice(1);
  };

  // Format demographic values for display
  const formatDemographic = (value?: string): string => {
    if (!value || value === 'prefer_not_to_say') return "Not Specified";
    // Convert from snake_case to Title Case
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl animate-scale-in">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Booking Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Personal Information */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Personal Information
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {booking.first_name} {booking.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">{booking.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white font-medium">{booking.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Type</p>
                  {booking.user_id ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      Registered
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      Guest
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Demographic Information */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Demographic Information
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {booking.age || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDemographic(booking.gender)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Race/Ethnicity</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDemographic(booking.race)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDemographic(booking.education)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profession</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDemographic(booking.profession)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Booking Information
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDate(booking.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</p>
                  <p className="text-gray-900 dark:text-white font-medium">{booking.time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-gray-900 dark:text-white font-medium">{booking.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatLocation(booking.location)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Group Size</p>
                  <p className="text-gray-900 dark:text-white font-medium">{booking.group_size} people</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-gray-900 dark:text-white font-medium font-bold">
                    ${booking.amount.toFixed(2)}
                  </p>
                </div>
                {booking.booking_reason && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Reason</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDemographic(booking.booking_reason)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seat information removed */}

          {/* Additional Notes */}
          {booking.notes && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Additional Notes
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white">{booking.notes}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 