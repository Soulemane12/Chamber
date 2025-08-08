import { useState, useEffect } from "react";

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
  seat_data?: string | null;
  user_id?: string | null;
  created_at?: string;
  status?: string;
  chamber_id?: string;
  session_notes?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancelled_reason?: string;
  chamber?: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
}

interface BookingDetailsModalProps {
  booking: GuestBookingInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (bookingId: string, updates: any) => void;
}

export default function BookingDetailsModal({ booking, isOpen, onClose, onUpdate }: BookingDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chambers, setChambers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    status: booking?.status || 'confirmed',
    chamber_id: booking?.chamber_id || '',
    session_notes: booking?.session_notes || '',
    cancelled_reason: booking?.cancelled_reason || ''
  });

  // Fetch chambers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchChambers();
      setFormData({
        status: booking?.status || 'confirmed',
        chamber_id: booking?.chamber_id || '',
        session_notes: booking?.session_notes || '',
        cancelled_reason: booking?.cancelled_reason || ''
      });
    }
  }, [isOpen, booking]);

  const fetchChambers = async () => {
    try {
      const response = await fetch('/api/admin/chambers');
      if (response.ok) {
        const data = await response.json();
        setChambers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching chambers:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: booking.id, 
          status: newStatus,
          cancelled_reason: newStatus === 'cancelled' ? formData.cancelled_reason : undefined
        })
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, status: newStatus }));
        onUpdate?.(booking.id, { status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChamberAssign = async (chamberId: string) => {
    if (!booking) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, chamber_id: chamberId })
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, chamber_id: chamberId }));
        onUpdate?.(booking.id, { chamber_id: chamberId });
      }
    } catch (error) {
      console.error('Error assigning chamber:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!booking) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, session_notes: formData.session_notes })
      });

      if (response.ok) {
        onUpdate?.(booking.id, { session_notes: formData.session_notes });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) {
    return null;
  }

  // Parse seat data if available
  const seatData = booking.seat_data 
    ? (typeof booking.seat_data === 'string' ? JSON.parse(booking.seat_data) : booking.seat_data)
    : [];

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
    if (loc === 'atmos') return 'ATMOS Hyperbaric';
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

  // Get status color
  const getStatusColor = (status: string) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl animate-scale-in">
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
          {/* Quick Actions Bar */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-3">
              {/* Status Change */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={loading}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              {/* Chamber Assignment */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Chamber:</span>
                <select
                  value={formData.chamber_id}
                  onChange={(e) => handleChamberAssign(e.target.value)}
                  disabled={loading}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                >
                  <option value="">No Chamber</option>
                  {chambers.map(chamber => (
                    <option key={chamber.id} value={chamber.id}>
                      {chamber.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Status Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(formData.status)}`}>
                  {formData.status}
                </span>
              </div>

              {loading && (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-blue-600">Updating...</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Personal Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4">
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

              {/* Booking Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Booking Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4">
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
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Reason</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatDemographic(booking.booking_reason)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Session Management */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Session Management
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-4">
                    {/* Session Notes */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Notes</p>
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={formData.session_notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, session_notes: e.target.value }))}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                            rows={3}
                            placeholder="Add session notes..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveNotes}
                              disabled={loading}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {formData.session_notes || 'No notes added'}
                        </p>
                      )}
                    </div>

                    {/* Cancellation Reason */}
                    {formData.status === 'cancelled' && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Cancellation Reason</p>
                        <input
                          type="text"
                          value={formData.cancelled_reason}
                          onChange={(e) => setFormData(prev => ({ ...prev, cancelled_reason: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter cancellation reason..."
                        />
                      </div>
                    )}

                    {/* Chamber Assignment */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assigned Chamber</p>
                      {formData.chamber_id ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded dark:bg-purple-900 dark:text-purple-200">
                            {chambers.find(c => c.id === formData.chamber_id)?.name || 'Unknown Chamber'}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No chamber assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Demographic Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4">
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
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profession</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatDemographic(booking.profession)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Information */}
          {seatData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" />
                </svg>
                Seat Information
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {seatData.map((seat: {seatId: number, name: string}, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-blue-600 dark:text-blue-400">Seat #{seat.seatId}</div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Assigned to:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {seat.name || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {booking.notes && (
            <div className="mt-6">
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
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 