"use client";

import { useState, useEffect } from "react";
import { 
  mockBookings, 
  getBookingsByTimePeriod, 
  getBookingsByDemographic,
  getAverageBookingsByLocation,
  getBookingRevenueByLocation
} from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";

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
  const [profiles, setProfiles] = useState<{ 
    id: string; 
    name: string; 
    address: string; 
    phone: string; 
    dob: string;
    avatar_url?: string | null;
    gender?: string;
    race?: string;
    education?: string;
    profession?: string;
  }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
  
  // Get data for charts
  const bookingsByTime = getBookingsByTimePeriod(timePeriod);
  const bookingsByDemographic = getBookingsByDemographic(demographic);
  const averageBookings = getAverageBookingsByLocation();
  const revenueData = getBookingRevenueByLocation(revenueLocation, revenuePeriod);
  
  // Calculate summary statistics
  const totalBookings = mockBookings.length;
  const totalRevenue = mockBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const averageBookingValue = totalRevenue / totalBookings;
  
  // Helper function to format demographic values for display
  const formatDemographic = (value: string | undefined): string => {
    if (!value) return "-";
    // Replace underscores with spaces and capitalize each word
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          title="Locations" 
          value="2" 
          subtitle="Midtown & Conyers"
        />
      </div>
      
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Average Bookings per Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Midtown Biohack</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{averageBookings.midtown}</div>
              <div className="ml-4 text-gray-600 dark:text-gray-400">bookings</div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {((averageBookings.midtown / totalBookings) * 100).toFixed(1)}% of total bookings
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platinum Wellness Spa</h3>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{averageBookings.conyers}</div>
              <div className="ml-4 text-gray-600 dark:text-gray-400">bookings</div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {((averageBookings.conyers / totalBookings) * 100).toFixed(1)}% of total bookings
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
      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Users</h2>
        
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profession</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{p.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <a href={`tel:${p.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">{p.phone}</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{p.dob}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDemographic(p.gender)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDemographic(p.race)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDemographic(p.education)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{p.profession || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          <p>Scroll horizontally to view all data</p>
        </div>
      </div>
    </div>
  );
} 