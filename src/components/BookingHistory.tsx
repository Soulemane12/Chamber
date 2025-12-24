"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { getServiceById } from '@/lib/services';

interface Booking {
  id: string;
  date: string;
  time: string;
  booking_reason: string;
  location: string;
  amount: number;
  payment_status: string;
  created_at: string;
}

interface BookingHistoryProps {
  userId: string;
}

export function BookingHistory({ userId }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Booking History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No bookings yet. Create your first booking to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Booking History
      </h2>
      <div className="space-y-3">
        {bookings.map((booking) => {
          const service = getServiceById(booking.booking_reason);
          return (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {service?.name || booking.booking_reason}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  booking.payment_status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : booking.payment_status === 'credit'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {booking.payment_status === 'credit' ? 'Paid with Credit' : 'Paid'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {booking.location === 'midtown' ? 'Midtown Biohack' : 'Other Location'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${(booking.amount / 100).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
