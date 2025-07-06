"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import UserEditModal, { UserProfile } from "./ui/UserEditModal";
import AdminChatbot from './AdminChatbot';

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
              
              // Update current angle for next segmentF
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

  const [dataRefreshInterval] = useState<number>(60000); // 1 minute refresh
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);

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
  
  // -------------------------------------------------
  // Booking-related state (declared early to prevent
  // temporal dead zone issues when referenced in
  // effects defined below)
  // -------------------------------------------------

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
    booking_reason?: string;
    notes?: string;
    gender?: string;
    race?: string;
    education?: string;
    profession?: string;
    age?: string | number;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    } | null;
  }

  // Full list of bookings (used in "Bookings" tab)
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [bookingsPage, setBookingsPage] = useState<number>(1);
  const [bookingsPageSize, setBookingsPageSize] = useState<number>(10);
  const [totalBookingsPages, setTotalBookingsPages] = useState<number>(1);
  const [totalBookingsCount, setTotalBookingsCount] = useState<number>(0);
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState<string>('');
  const [bookingsDateRange, setBookingsDateRange] = useState<{startDate: string, endDate: string}>({
    startDate: '',
    endDate: ''
  });
  const [bookingsLocation, setBookingsLocation] = useState<string>('');
  const [bookingsSortBy, setBookingsSortBy] = useState<string>('date');
  const [bookingsSortOrder, setBookingsSortOrder] = useState<'asc' | 'desc'>('desc');

  // Summary statistics displayed in top cards
  const [summaryStats, setSummaryStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
  });

  // Loading & error flags shared between views
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Store all raw data for client-side filtering
  const [allBookingsData, setAllBookingsData] = useState<Booking[]>([]);
  const [allBookingsByTime, setAllBookingsByTime] = useState<{
    day: Record<string, number>;
    month: Record<string, number>;
    quarter: Record<string, number>;
    year: Record<string, number>;
  }>({
    day: {},
    month: {},
    quarter: {},
    year: {}
  });
  const [allBookingsByDemographic, setAllBookingsByDemographic] = useState<{
    age: Record<string, number>;
    gender: Record<string, number>;
    race: Record<string, number>;
    education: Record<string, number>;
    profession: Record<string, number>;
  }>({
    age: {},
    gender: {},
    race: {},
    education: {},
    profession: {}
  });
  const [allRevenueData, setAllRevenueData] = useState<{
    day: {
      all: Record<string, number>;
      midtown: Record<string, number>;
      conyers: Record<string, number>;
    };
    week: {
      all: Record<string, number>;
      midtown: Record<string, number>;
      conyers: Record<string, number>;
    };
    month: {
      all: Record<string, number>;
      midtown: Record<string, number>;
      conyers: Record<string, number>;
    };
    year: {
      all: Record<string, number>;
      midtown: Record<string, number>;
      conyers: Record<string, number>;
    };
  }>({
    day: { all: {}, midtown: {}, conyers: {} },
    week: { all: {}, midtown: {}, conyers: {} },
    month: { all: {}, midtown: {}, conyers: {} },
    year: { all: {}, midtown: {}, conyers: {} }
  });
  
  // Update fetchAllBookingData to handle pagination and filtering
  const fetchAllBookingData = async () => {
    setBookingsLoading(true);
    try {
      // Build query string with filters
      const params = new URLSearchParams();
      if (bookingsSearchQuery) params.append('search', bookingsSearchQuery);
      if (bookingsDateRange.startDate) params.append('startDate', bookingsDateRange.startDate);
      if (bookingsDateRange.endDate) params.append('endDate', bookingsDateRange.endDate);
      if (bookingsLocation) params.append('location', bookingsLocation);
      if (bookingsSortBy) params.append('sortBy', bookingsSortBy);
      if (bookingsSortOrder) params.append('sortOrder', bookingsSortOrder);
      params.append('page', bookingsPage.toString());
      params.append('pageSize', bookingsPageSize.toString());
      
      // Check if bookings table exists and load all bookings
      const checkResponse = await fetch(`/api/admin/bookings?${params}`);
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
        const responseData = await checkResponse.json();
        setAllBookings(responseData.data || []);
        if (responseData.pagination) {
          setTotalBookingsCount(responseData.pagination.total);
          setTotalBookingsPages(responseData.pagination.totalPages);
        }
        setAllBookingsData(responseData.data || []);
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
      
      // Fetch all time period data at once
      const periods = ['day', 'month', 'quarter', 'year'] as const;
      const timeData: Record<string, Record<string, number>> = {};
      
      for (const period of periods) {
      const timeResponse = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'byTimePeriod',
            period 
        }),
      });
      
      if (timeResponse.ok) {
        const { data } = await timeResponse.json();
          timeData[period] = data;
        }
      }
      
      setAllBookingsByTime({
        day: timeData.day || {},
        month: timeData.month || {},
        quarter: timeData.quarter || {},
        year: timeData.year || {}
      });
      // Set initial view
      setBookingsByTime(timeData[timePeriod] || {});
      
      // Fetch all demographic data at once
      const demographics = ['age', 'gender', 'race', 'education', 'profession'] as const;
      const demographicData: Record<string, Record<string, number>> = {};
      
      for (const demo of demographics) {
      const demographicResponse = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'byDemographic',
            demographic: demo 
        }),
      });
      
      if (demographicResponse.ok) {
        const { data } = await demographicResponse.json();
          demographicData[demo] = data;
        }
      }
      
      setAllBookingsByDemographic({
        age: demographicData.age || {},
        gender: demographicData.gender || {},
        race: demographicData.race || {},
        education: demographicData.education || {},
        profession: demographicData.profession || {}
      });
      // Set initial view
      setBookingsByDemographic(demographicData[demographic] || {});
      
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
      
      // Fetch all revenue data at once
      const revPeriods = ['day', 'week', 'month', 'year'] as const;
      const locations = ['all', 'midtown', 'conyers'] as const;
      const revenueData: Record<string, Record<string, Record<string, number>>> = {
        day: { all: {}, midtown: {}, conyers: {} },
        week: { all: {}, midtown: {}, conyers: {} },
        month: { all: {}, midtown: {}, conyers: {} },
        year: { all: {}, midtown: {}, conyers: {} }
      };
      
      for (const period of revPeriods) {
        // Period already initialized in revenueData
        
        for (const loc of locations) {
      const revenueResponse = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'revenue',
              period,
              location: loc
        }),
      });
      
      if (revenueResponse.ok) {
        const { data } = await revenueResponse.json();
            revenueData[period][loc] = data;
          }
        }
      }
      
      setAllRevenueData({
        day: {
          all: revenueData.day?.all || {},
          midtown: revenueData.day?.midtown || {},
          conyers: revenueData.day?.conyers || {}
        },
        week: {
          all: revenueData.week?.all || {},
          midtown: revenueData.week?.midtown || {},
          conyers: revenueData.week?.conyers || {}
        },
        month: {
          all: revenueData.month?.all || {},
          midtown: revenueData.month?.midtown || {},
          conyers: revenueData.month?.conyers || {}
        },
        year: {
          all: revenueData.year?.all || {},
          midtown: revenueData.year?.midtown || {},
          conyers: revenueData.year?.conyers || {}
        }
      });
      // Set initial view
      setRevenueData(revenueData[revenuePeriod][revenueLocation] || {});
      
      setLastRefreshed(new Date());
      setBookingsError(null);
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      setBookingsError('Failed to load booking analytics');
    } finally {
      setBookingsLoading(false);
    }
  };
  
  // Add this useEffect to fetch bookings when filters change
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchAllBookingData();
    }
  }, [
    activeTab,
    bookingsPage,
    bookingsPageSize,
    bookingsSortBy,
    bookingsSortOrder,
    bookingsLocation
  ]);
  
  // Initial data loading and auto-refresh
  useEffect(() => {
    // Initial data load
    fetchAllBookingData();
    
    // Set up auto-refresh only if enabled
    let refreshInterval: NodeJS.Timeout | null = null;
    if (autoRefreshEnabled) {
      refreshInterval = setInterval(() => {
        console.log('Auto-refreshing data...');
        fetchAllBookingData();
      }, dataRefreshInterval);
    }
    
    // Cleanup interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [dataRefreshInterval, autoRefreshEnabled]); // Depend on refresh interval and auto-refresh toggle
  
  // Add handler for search form submission
  const handleBookingsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingsPage(1); // Reset to first page
    fetchAllBookingData();
  };
  
  // Update displayed data when filters change - no API calls needed
  useEffect(() => {
    if (Object.keys(allBookingsByTime).length > 0) {
      setBookingsByTime(allBookingsByTime[timePeriod] || {});
    }
  }, [timePeriod, allBookingsByTime]);
  
  useEffect(() => {
    if (Object.keys(allBookingsByDemographic).length > 0) {
      setBookingsByDemographic(allBookingsByDemographic[demographic] || {});
    }
  }, [demographic, allBookingsByDemographic]);
  
  useEffect(() => {
    if (Object.keys(allRevenueData).length > 0 && 
        Object.keys(allRevenueData[revenuePeriod] || {}).length > 0) {
      setRevenueData(allRevenueData[revenuePeriod][revenueLocation] || {});
    }
  }, [revenuePeriod, revenueLocation, allRevenueData, demographic, timePeriod]);
  
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
  
  // Helper function to calculate age from date of birth
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    // Check if birthDate is valid
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If hasn't had birthday this year yet, subtract one year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  };
  
  // Helper function to get age group from age - used in demographic calculations
  function getAgeGroup(age: number | null): string {
    if (age === null) return "Not Specified";
    if (age < 25) return "18-24";
    else if (age < 35) return "25-34";
    else if (age < 45) return "35-44";
    else if (age < 55) return "45-54";
    else if (age < 65) return "55-64";
    else return "65+";
  }
  
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
  
  // Demographic options for the dropdown
  const demographicOptions = [
    { value: 'age', label: 'Age Group' },
    { value: 'gender', label: 'Gender' },
    { value: 'race', label: 'Race/Ethnicity' },
    { value: 'education', label: 'Education Level' },
    { value: 'profession', label: 'Profession' },
  ];

  // Manual refresh function
  const handleManualRefresh = async () => {
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
        setAllBookingsData(bookingsData);
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
      
      // Refresh all other data...
      // (Similar to the code in useEffect, but simplified for brevity)
      
      setLastRefreshed(new Date());
      setBookingsError(null);
    } catch (error) {
      console.error('Error manually refreshing data:', error);
      setBookingsError('Failed to refresh data');
    } finally {
      setBookingsLoading(false);
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
          subtitle={`Last updated: ${lastRefreshed.toLocaleTimeString()}`}
        />
        <StatCard 
          title="Users" 
          value={profiles.length} 
          subtitle="Total registered users"
        />
      </div>
      
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-4">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 w-full sm:w-auto">
          <button
            className={`py-2 px-4 ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'bookings'
                ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
        </div>
        
        {/* Data refresh controls */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Auto-refresh
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Updated: {lastRefreshed.toLocaleTimeString()}
          </div>
          
          <button
            onClick={handleManualRefresh}
            disabled={bookingsLoading}
            className="flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {bookingsLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
      
      {activeTab === 'analytics' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Time Period Analytics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bookings by Time</h3>
                <div className="flex-shrink-0">
                  <select
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as 'day' | 'month' | 'quarter' | 'year')}
                  >
                    <option value="day">Daily</option>
                    <option value="month">Monthly</option>
                    <option value="quarter">Quarterly</option>
                    <option value="year">Yearly</option>
                  </select>
              </div>
            </div>
              <div className="relative">
                {Object.keys(bookingsByTime).length === 0 && !bookingsLoading ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10">No time period data available</p>
                ) : (
                  <div className={`transition-opacity duration-300 ${Object.keys(bookingsByTime).length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <BarChart data={bookingsByTime} title="Bookings" />
          </div>
        )}
                {bookingsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-800/75">
                    <div className="animate-pulse flex flex-col items-center">
                      <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading data...</span>
            </div>
          </div>
                )}
          </div>
      </div>
      
            {/* Demographic Analytics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {getDemographicChartTitle()}
                </h3>
                <div className="flex-shrink-0">
                  <select
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    value={demographic}
                    onChange={(e) => setDemographic(e.target.value as 'age' | 'gender' | 'race' | 'education' | 'profession')}
                  >
                    {demographicOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
          </div>
        </div>
              <div className="relative">
                {Object.keys(bookingsByDemographic).length === 0 && !bookingsLoading ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10">No demographic data available</p>
                ) : (
                  <div className={`transition-opacity duration-300 ${Object.keys(bookingsByDemographic).length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <PieChart data={bookingsByDemographic} title={getDemographicChartTitle()} />
      </div>
                )}
                {bookingsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-800/75">
                    <div className="animate-pulse flex flex-col items-center">
                      <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading data...</span>
            </div>
            </div>
                )}
          </div>
            </div>

            {/* Average Bookings by Location */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Average Bookings by Location</h3>
              <div className="relative">
                {(!averageBookings || (averageBookings.midtown === 0 && averageBookings.conyers === 0)) && !bookingsLoading ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10">No location data available</p>
                ) : (
                  <div className={`transition-opacity duration-300 ${averageBookings ? 'opacity-100' : 'opacity-0'}`}>
                    <BarChart
                      data={averageBookings}
                      title="Average Bookings"
                      maxHeight={150}
                    />
            </div>
                )}
                {bookingsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-800/75">
                    <div className="animate-pulse flex flex-col items-center">
                      <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading data...</span>
          </div>
                  </div>
                )}
        </div>
      </div>
      
            {/* Revenue Analytics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue</h3>
                <div className="flex space-x-2">
                  <select
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    value={revenuePeriod}
                    onChange={(e) => setRevenuePeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                  <select
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    value={revenueLocation}
                    onChange={(e) => setRevenueLocation(e.target.value as 'all' | 'midtown' | 'conyers')}
                  >
                    <option value="all">All Locations</option>
                    <option value="midtown">Midtown</option>
                    <option value="conyers">Conyers</option>
                  </select>
            </div>
            </div>
              <div className="relative">
                {Object.keys(revenueData).length === 0 && !bookingsLoading ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-10">No revenue data available</p>
                ) : (
                  <div className={`transition-opacity duration-300 ${Object.keys(revenueData).length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <BarChart data={revenueData} title="Revenue" />
          </div>
                )}
                {bookingsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-800/75">
                    <div className="animate-pulse flex flex-col items-center">
                      <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading data...</span>
        </div>
        </div>
                )}
        </div>
      </div>
          </div>
        </div>
      ) : activeTab === 'bookings' ? (
        /* Bookings Tab */
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Bookings</h2>
            <p className="text-gray-600 dark:text-gray-400">View and manage all bookings</p>
          </div>
          
          {/* Search and filters */}
          <div className="mb-6">
            <form onSubmit={handleBookingsSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-1 md:col-span-4 lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={bookingsSearchQuery}
                  onChange={(e) => setBookingsSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={bookingsDateRange.startDate}
                  onChange={(e) => setBookingsDateRange({...bookingsDateRange, startDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={bookingsDateRange.endDate}
                  onChange={(e) => setBookingsDateRange({...bookingsDateRange, endDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={bookingsLocation}
                  onChange={(e) => setBookingsLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  <option value="midtown">Midtown</option>
                  <option value="conyers">Conyers</option>
                </select>
              </div>

              <div className="flex space-x-2 items-end col-span-1 md:col-span-4 lg:col-span-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingsSearchQuery('');
                    setBookingsDateRange({ startDate: '', endDate: '' });
                    setBookingsLocation('');
                    setBookingsSortBy('date');
                    setBookingsSortOrder('desc');
                    setBookingsPage(1);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </form>
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
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
                  <select
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                    value={bookingsSortBy}
                    onChange={(e) => {
                      setBookingsSortBy(e.target.value);
                      setBookingsPage(1);
                    }}
                  >
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                    <option value="first_name">First Name</option>
                    <option value="last_name">Last Name</option>
                    <option value="location">Location</option>
                    <option value="amount">Amount</option>
                    <option value="created_at">Created At</option>
                  </select>
                  <button
                    onClick={() => {
                      setBookingsSortOrder(bookingsSortOrder === 'asc' ? 'desc' : 'asc');
                      setBookingsPage(1);
                    }}
                    className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={bookingsSortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                  >
                    {bookingsSortOrder === 'asc' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {allBookings.length} of {totalBookingsCount} bookings
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
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
                            {booking.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {booking.duration} min
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Group size: {booking.group_size}
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
              
              {/* Pagination */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {bookingsPage} of {totalBookingsPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setBookingsPage(Math.max(1, bookingsPage - 1))}
                    disabled={bookingsPage <= 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setBookingsPage(Math.min(totalBookingsPages, bookingsPage + 1))}
                    disabled={bookingsPage >= totalBookingsPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <span title={p.dob || ''}>
                            {calculateAge(p.dob) !== null ? `${calculateAge(p.dob)} years` : '-'}
                          </span>
                        </td>
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
      {/* Keep the floating AI Assistant button */}
      <AdminChatbot mode="floating" />
    </div>
  );
} 