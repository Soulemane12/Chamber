"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import UserEditModal, { UserProfile } from "./ui/UserEditModal";

// Simple chart component using div heights
function BarChart({ data, title, maxHeight = 200 }: { data: Record<string, number>, title: string, maxHeight?: number }) {
  const maxValue = Math.max(...Object.values(data));
  const entries = Object.entries(data);
  
  // Format labels based on key format
  const formatLabel = (key: string) => {
    // For day format (YYYY-MM-DD)
    if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = key.split('-');
      return `${parts[1]}/${parts[2]}`;
    }
    // For month format (YYYY-MM)
    else if (key.match(/^\d{4}-\d{2}$/)) {
      const parts = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(parts[1]) - 1;
      return monthNames[monthIndex];
    }
    // For quarter format (YYYY-Q#)
    else if (key.match(/^\d{4}-Q[1-4]$/)) {
      return key.split('-')[1];
    }
    // Default case
    return key;
  };
  
  // Limit the number of bars to display for better visualization
  const displayEntries = entries.length > 15 
    ? entries.slice(-15).sort((a, b) => a[0].localeCompare(b[0]))
    : entries.sort((a, b) => a[0].localeCompare(b[0]));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      
      {displayEntries.length > 0 ? (
        <div className="flex items-end h-64 space-x-1 overflow-x-auto pb-2">
          {displayEntries.map(([key, value]) => {
            const height = maxValue > 0 ? (value / maxValue) * maxHeight : 0;
            return (
              <div key={key} className="flex flex-col items-center flex-1 min-w-[40px]">
                <div className="w-full text-center mb-1 text-xs text-gray-600 dark:text-gray-400 truncate" title={value.toString()}>
                  {value}
                </div>
                <div 
                  className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all duration-500 ease-in-out hover:bg-blue-600 dark:hover:bg-blue-500" 
                  style={{ height: `${height}px` }}
                ></div>
                <div className="w-full text-center mt-2 text-xs text-gray-600 dark:text-gray-400 truncate" title={key}>
                  {formatLabel(key)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data available for this time period
        </div>
      )}
      
      {displayEntries.length > 0 && displayEntries.length < entries.length && (
        <div className="mt-2 text-xs text-right text-gray-500 dark:text-gray-400">
          * Showing the last {displayEntries.length} periods
        </div>
      )}
    </div>
  );
}

function PieChart({ data, title }: { data: Record<string, number>, title: string }) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  let currentAngle = 0;
  
  // Generate colors for pie segments
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {Object.entries(data).map(([key, value], index) => {
              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              // Calculate start and end points
              const startX = 50 + 50 * Math.cos((currentAngle * Math.PI) / 180);
              const startY = 50 + 50 * Math.sin((currentAngle * Math.PI) / 180);
              const endAngle = currentAngle + angle;
              const endX = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
              
              // Create path
              const path = `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
              
              // Update current angle for next segment
              currentAngle += angle;
              
              return (
                <path 
                  key={key} 
                  d={path} 
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data).map(([key, value], index) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {key}: {value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [timePeriod, setTimePeriod] = useState<'day' | 'month' | 'quarter' | 'year'>('month');
  const [demographic, setDemographic] = useState<'age' | 'gender' | 'race' | 'education' | 'profession'>('age');
  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [revenueLocation, setRevenueLocation] = useState<'all' | 'midtown' | 'conyers'>('all');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'bookings'>('analytics');

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (response.ok) {
          const data = await response.json();
          setProfiles(data);
          setError(null);
        } else {
          console.error("Failed to fetch profiles:", response.status);
          if (response.status === 500) {
            const errorData = await response.json().catch(() => null);
            if (errorData && errorData.error && errorData.error.includes('column')) {
              setError("Database schema needs to be updated. Please run the migration.");
            } else {
              setError("Failed to fetch profiles. Please try again later.");
            }
          } else {
            setError("Failed to fetch profiles. Please try again later.");
          }
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
        setError("An error occurred while fetching profiles.");
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);
  
  // State for booking data
  const [bookingsByTime, setBookingsByTime] = useState<Record<string, number>>({});
  const [bookingsByDemographic, setBookingsByDemographic] = useState<Record<string, number>>({});
  const [averageBookings, setAverageBookings] = useState<{midtown: number, conyers: number}>({midtown: 0, conyers: 0});
  const [revenueData, setRevenueData] = useState<Record<string, number>>({});
  
  // Demographic options for the dropdown
  const demographicOptions = [
    { value: 'age', label: 'Age Group' },
    { value: 'gender', label: 'Gender' },
    { value: 'race', label: 'Race/Ethnicity' },
    { value: 'education', label: 'Education Level' },
    { value: 'profession', label: 'Profession' },
  ];
  interface Booking {
    id: string;
    user_id: string;
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
    age?: string;
    gender?: string;
    race?: string;
    education?: string;
    profession?: string;
    booking_reason?: string;
    notes?: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      age?: string;
      gender?: string;
      race?: string;
      education?: string;
      profession?: string;
    } | null;
  }

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0
  });
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Fetch booking data
  useEffect(() => {
    const fetchBookingAnalytics = async () => {
      setBookingsLoading(true);
      try {
        // Check if bookings table exists and load all bookings
        const checkResponse = await fetch('/api/admin/bookings');
        if (!checkResponse.ok) {
          if (checkResponse.status === 404) {
            setBookingsError('Bookings table does not exist. Please set up the database.');
            setBookingsLoading(false);
            return;
          }
          const errorData = await checkResponse.json().catch(() => null);
          console.error('Error fetching bookings:', errorData);
          throw new Error(errorData?.message || 'Failed to load bookings');
        } else {
          // If successful, we have all bookings data
          const bookingsData = await checkResponse.json();
          console.log('Bookings data:', bookingsData); // Debug log
          setAllBookings(bookingsData);
        }
        
        // Get summary stats
        const summaryResponse = await fetch('/api/admin/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'summary' }),
        });
        
        if (summaryResponse.ok) {
          const { data } = await summaryResponse.json();
          setSummaryStats(data);
        }
        
        // Get time period data
        const timeResponse = await fetch('/api/admin/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'byTimePeriod',
            period: timePeriod 
          }),
        });
        
        if (timeResponse.ok) {
          const { data } = await timeResponse.json();
          setBookingsByTime(data);
        }
        
        // Get demographic data
        const demographicResponse = await fetch('/api/admin/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'byDemographic',
            demographic 
          }),
        });
        
        if (demographicResponse.ok) {
          const { data } = await demographicResponse.json();
          setBookingsByDemographic(data);
        }
        
        // Get location data
        const locationResponse = await fetch('/api/admin/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'byLocation'
          }),
        });
        
        if (locationResponse.ok) {
          const { data } = await locationResponse.json();
          setAverageBookings(data);
        }
        
        // Get revenue data
        const revenueResponse = await fetch('/api/admin/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            type: 'revenue',
            period: revenuePeriod,
            location: revenueLocation
          }),
        });
        
        if (revenueResponse.ok) {
          const { data } = await revenueResponse.json();
          setRevenueData(data);
        }
        
        setBookingsError(null);
      } catch (error) {
        console.error('Error fetching booking analytics:', error);
        setBookingsError('Failed to load booking analytics');
      } finally {
        setBookingsLoading(false);
      }
    };
    
    fetchBookingAnalytics();
  }, [timePeriod, demographic, revenuePeriod, revenueLocation]);
  
  // Extract summary statistics
  const { totalBookings, totalRevenue, averageBookingValue } = summaryStats;
  
  // Helper function to format demographic values for display
  const formatDemographic = (value: string | undefined): string => {
    if (!value) return "Not Specified";
    // Convert from snake_case to Title Case
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Helper function to get chart title based on selected demographic
  const getDemographicChartTitle = () => {
    const option = demographicOptions.find(opt => opt.value === demographic);
    return `Bookings by ${option?.label || 'Demographic'}`;
  };

  // Handle edit user button click
  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Handle user save
  const handleSaveUser = async (updatedUser: UserProfile) => {
    try {
      const response = await fetch(`/api/admin/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updatedData = await response.json();

      // Update the profiles state with the updated user
      setProfiles(profiles.map(profile => 
        profile.id === updatedData.id ? updatedData : profile
      ));

      // Reset selected user and close modal
      setSelectedUser(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error; // Re-throw to be caught by the modal's error handler
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Bookings" 
          value={totalBookings} 
          subtitle="All time"
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          subtitle="All time"
        />
        <StatCard 
          title="Average Booking Value" 
          value={formatCurrency(averageBookingValue)} 
        />
        <StatCard 
          title="Users" 
          value={profiles.length} 
          subtitle="Total registered users"
        />
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Users
          </button>
        </nav>
      </div>
      
      {activeTab === 'analytics' ? (
        <>
        {bookingsError && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{bookingsError}</p>
                {bookingsError.includes("table") && (
                  <a 
                    href="/api/admin/setup-db" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Setup Booking Database
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {bookingsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : summaryStats.totalBookings === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Booking Data Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Once customers start making bookings, you&apos;ll see analytics here.
            </p>
          </div>
        ) : (
        <>
      {/* Bookings by Time Period */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bookings by Time Period</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setTimePeriod('day')}
              className={`px-3 py-1 rounded-md text-sm ${
                timePeriod === 'day' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Daily
            </button>
            <button 
              onClick={() => setTimePeriod('month')}
              className={`px-3 py-1 rounded-md text-sm ${
                timePeriod === 'month' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setTimePeriod('quarter')}
              className={`px-3 py-1 rounded-md text-sm ${
                timePeriod === 'quarter' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Quarterly
            </button>
            <button 
              onClick={() => setTimePeriod('year')}
              className={`px-3 py-1 rounded-md text-sm ${
                timePeriod === 'year' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
        <BarChart 
          data={bookingsByTime} 
          title={`Bookings by ${timePeriod === 'day' ? 'Day' : timePeriod === 'month' ? 'Month' : timePeriod === 'quarter' ? 'Quarter' : 'Year'}`} 
        />
      </div>
      
      {/* Bookings by Demographics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bookings by Demographics</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setDemographic('age')}
              className={`px-3 py-1 rounded-md text-sm ${
                demographic === 'age' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Age
            </button>
            <button 
              onClick={() => setDemographic('gender')}
              className={`px-3 py-1 rounded-md text-sm ${
                demographic === 'gender' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Gender
            </button>
            <button 
              onClick={() => setDemographic('race')}
              className={`px-3 py-1 rounded-md text-sm ${
                demographic === 'race' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Race
            </button>
            <button 
              onClick={() => setDemographic('education')}
              className={`px-3 py-1 rounded-md text-sm ${
                demographic === 'education' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Education
            </button>
            <button 
              onClick={() => setDemographic('profession')}
              className={`px-3 py-1 rounded-md text-sm ${
                demographic === 'profession' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Profession
            </button>
          </div>
        </div>
        <PieChart 
          data={bookingsByDemographic} 
          title={`Bookings by ${demographic.charAt(0).toUpperCase() + demographic.slice(1)}`} 
        />
      </div>
      
      {/* Average Bookings per Location */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Bookings per Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Midtown Biohack</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{averageBookings.midtown}</div>
              <div className="ml-4 text-gray-600 dark:text-gray-400">bookings</div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {totalBookings ? ((averageBookings.midtown / totalBookings) * 100).toFixed(1) : 0}% of total bookings
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platinum Wellness Spa</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{averageBookings.conyers}</div>
              <div className="ml-4 text-gray-600 dark:text-gray-400">bookings</div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {totalBookings ? ((averageBookings.conyers / totalBookings) * 100).toFixed(1) : 0}% of total bookings
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Revenue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Revenue</h2>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 mr-4">
              <button 
                onClick={() => setRevenueLocation('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  revenueLocation === 'all' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Locations
              </button>
              <button 
                onClick={() => setRevenueLocation('midtown')}
                className={`px-3 py-1 rounded-md text-sm ${
                  revenueLocation === 'midtown' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Midtown
              </button>
              <button 
                onClick={() => setRevenueLocation('conyers')}
                className={`px-3 py-1 rounded-md text-sm ${
                  revenueLocation === 'conyers' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Conyers
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setRevenuePeriod('day')}
                className={`px-3 py-1 rounded-md text-sm ${
                  revenuePeriod === 'day' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Daily
              </button>
              <button 
                onClick={() => setRevenuePeriod('week')}
                className={`px-3 py-1 rounded-md text-sm ${
                  revenuePeriod === 'week' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setRevenuePeriod('month')}
                className={`px-3 py-1 rounded-md text-sm ${
                  revenuePeriod === 'month' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setRevenuePeriod('year')}
                className={`px-3 py-1 rounded-md text-sm ${
                  revenuePeriod === 'year' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <BarChart 
            data={revenueData} 
            title={`Revenue by ${revenuePeriod === 'day' ? 'Day' : revenuePeriod === 'week' ? 'Week' : revenuePeriod === 'month' ? 'Month' : 'Year'} (${revenueLocation === 'all' ? 'All Locations' : revenueLocation === 'midtown' ? 'Midtown' : 'Conyers'})`} 
          />
        </div>
        
        <div className="mt-4 text-right">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            * Values shown in {formatCurrency(0).replace('0', '')}
          </span>
        </div>
      </div>
          </>
        )}
        </>
      ) : activeTab === 'bookings' ? (
        /* Bookings Tab */
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Bookings</h2>
            <p className="text-gray-600 dark:text-gray-400">View and manage all bookings</p>
          </div>
          
          {bookingsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : bookingsError ? (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{bookingsError}</p>
                </div>
              </div>
            </div>
          ) : allBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Demographics</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {allBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {booking.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.first_name} {booking.last_name}
                        </div>
                        {booking.user?.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.user.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {booking.phone}
                        </div>
                        {booking.user?.phone && booking.user.phone !== booking.phone && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {booking.duration} min session
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Group size: {booking.group_size}
                        </div>
                        {booking.booking_reason && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Reason: {formatDemographic(booking.booking_reason)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          {booking.age && (
                            <div className="text-gray-900 dark:text-white flex">
                              <span className="font-medium w-16">Age:</span> {booking.age}
                            </div>
                          )}
                          {booking.gender && (
                            <div className="text-gray-900 dark:text-white flex">
                              <span className="font-medium w-16">Gender:</span> {formatDemographic(booking.gender)}
                            </div>
                          )}
                          {booking.race && (
                            <div className="text-gray-900 dark:text-white flex">
                              <span className="font-medium w-16">Race:</span> {formatDemographic(booking.race)}
                            </div>
                          )}
                          {booking.education && (
                            <div className="text-gray-900 dark:text-white flex">
                              <span className="font-medium w-16">Education:</span> {formatDemographic(booking.education)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.location === 'midtown' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {booking.location === 'midtown' ? 'Midtown' : 'Conyers'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* User Management Tab */
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </button>
            </div>
          </div>
        
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                {error.includes("migration") && (
                  <a 
                    href="/api/admin/migrate" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Run Database Migration
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="min-w-max">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DOB</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Race</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Education</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            {p.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</div>
                          </div>
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{p.address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {p.phone ? (
                        <a href={`tel:${p.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">{p.phone}</a>
                          ) : '-'}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{p.dob || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDemographic(p.gender)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDemographic(p.race)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDemographic(p.education)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                          <button 
                            onClick={() => handleEditUser(p)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            Delete
                          </button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">{profiles.length}</span> users
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* User Edit Modal */}
      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
} 