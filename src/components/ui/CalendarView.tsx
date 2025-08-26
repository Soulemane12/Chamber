"use client";

import { useState, useEffect } from 'react';


interface Booking {
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
  status?: string;
  chamber_id?: string;
  session_notes?: string;
  chamber?: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
}

interface CalendarViewProps {
  view: 'daily' | 'weekly' | 'monthly';
  bookings?: Booking[];
  chambers?: any[];
  onBookingClick?: (booking: Booking) => void;
  onStatusChange?: (bookingId: string, status: string) => void;
  onChamberAssign?: (bookingId: string, chamberId: string) => void;
  onRefresh?: () => void;
}

export default function CalendarView({ 
  view, 
  bookings: propBookings = [],
  chambers: propChambers = [],
  onBookingClick, 
  onStatusChange, 
  onChamberAssign,
  onRefresh
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // Use props for bookings and chambers
  const bookings = propBookings;
  const chambers = propChambers;

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateStr);
  };

  // Get week days
  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get month days
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push(day);
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month to fill last week
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Handle status change
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: newStatus })
      });

      if (response.ok) {
        // Call parent's refresh function
        onRefresh?.();
        onStatusChange?.(bookingId, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle chamber assignment
  const handleChamberAssign = async (bookingId: string, chamberId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, chamber_id: chamberId })
      });

      if (response.ok) {
        // Call parent's refresh function
        onRefresh?.();
        onChamberAssign?.(bookingId, chamberId);
      }
    } catch (error) {
      console.error('Error assigning chamber:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              if (view === 'daily') newDate.setDate(newDate.getDate() - 1);
              else if (view === 'weekly') newDate.setDate(newDate.getDate() - 7);
              else newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {view === 'daily' && currentDate.toLocaleDateString()}
            {view === 'weekly' && `${currentDate.toLocaleDateString()} - ${new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
            {view === 'monthly' && currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              if (view === 'daily') newDate.setDate(newDate.getDate() + 1);
              else if (view === 'weekly') newDate.setDate(newDate.getDate() + 7);
              else newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {view === 'daily' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            
            <div className="space-y-4">
              {getBookingsForDate(currentDate).map(booking => (
                <div
                  key={booking.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => onBookingClick?.(booking)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {booking.time}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status || 'pending'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>{booking.first_name} {booking.last_name}</strong></p>
                        <p>{booking.email}</p>
                        <p>{booking.phone}</p>
                        <p>{booking.duration} min • {booking.group_size} people</p>
                        <p className="font-medium">Free</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(booking.id, 'completed');
                          }}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                          title="Mark as Completed"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(booking.id, 'cancelled');
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                          title="Cancel Booking"
                        >
                          ✕
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(booking.id, 'no_show');
                          }}
                          className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                          title="Mark as No Show"
                        >
                          ⊘
                        </button>
                      </div>
                      
                      <select
                        value={booking.chamber_id || ''}
                        onChange={(e) => handleChamberAssign(booking.id, e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">No Chamber</option>
                        {chambers.map(chamber => (
                          <option key={chamber.id} value={chamber.id}>
                            {chamber.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              {getBookingsForDate(currentDate).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No bookings for this date
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'weekly' && (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {getWeekDays(currentDate).map((date, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {date.toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${
                      date.toDateString() === new Date().toDateString() 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {getBookingsForDate(date).slice(0, 3).map(booking => (
                      <div
                        key={booking.id}
                        className="text-xs p-2 bg-blue-50 dark:bg-blue-900/30 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        onClick={() => onBookingClick?.(booking)}
                        title={`${booking.time} - ${booking.first_name} ${booking.last_name}`}
                      >
                        <div className="font-medium truncate">
                          {booking.time}
                        </div>
                        <div className="truncate">
                          {booking.first_name} {booking.last_name}
                        </div>
                        <div className={`inline-block px-1 py-0.5 text-xs rounded ${getStatusColor(booking.status)}`}>
                          {booking.status || 'pending'}
                        </div>
                        
                        {/* Quick action buttons */}
                        <div className="flex space-x-1 mt-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                            title="Mark as Completed"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                            title="Cancel Booking"
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'no_show')}
                            className="text-xs px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                            title="Mark as No Show"
                          >
                            ⊘
                          </button>
                        </div>
                        
                        {/* Chamber assignment */}
                        <select
                          value={booking.chamber_id || ''}
                          onChange={(e) => handleChamberAssign(booking.id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 mt-1 w-full dark:bg-gray-700 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">No Chamber</option>
                          {chambers.map(chamber => (
                            <option key={chamber.id} value={chamber.id}>
                              {chamber.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                    
                    {getBookingsForDate(date).length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{getBookingsForDate(date).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getMonthDays(currentDate).map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const dayBookings = getBookingsForDate(date);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                      isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : isCurrentMonth 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map(booking => (
                        <div
                          key={booking.id}
                          className="text-xs p-1 bg-blue-50 dark:bg-blue-900/30 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50"
                          onClick={() => onBookingClick?.(booking)}
                          title={`${booking.time} - ${booking.first_name} ${booking.last_name}`}
                        >
                          <div className="font-medium truncate">
                            {booking.time}
                          </div>
                          <div className="truncate">
                            {booking.first_name} {booking.last_name}
                          </div>
                          
                          {/* Quick action buttons */}
                          <div className="flex space-x-1 mt-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'completed')}
                              className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                              title="Mark as Completed"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                              title="Cancel Booking"
                            >
                              ✕
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'no_show')}
                              className="text-xs px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                              title="Mark as No Show"
                            >
                              ⊘
                            </button>
                          </div>
                          
                          {/* Chamber assignment */}
                          <select
                            value={booking.chamber_id || ''}
                            onChange={(e) => handleChamberAssign(booking.id, e.target.value)}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 mt-1 w-full dark:bg-gray-700 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">No Chamber</option>
                            {chambers.map(chamber => (
                              <option key={chamber.id} value={chamber.id}>
                                {chamber.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                      
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 