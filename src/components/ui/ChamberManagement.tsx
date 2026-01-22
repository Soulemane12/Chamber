"use client";

import { useState, useEffect } from 'react';

interface Chamber {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'in_use' | 'maintenance' | 'cleaning';
  location: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

interface ChamberSession {
  id: string;
  chamber_id: string;
  booking_id: string;
  session_date: string;
  session_time: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  chambers: Chamber;
  bookings: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    group_size: number;
    amount: number;
    status: string;
  };
}

interface CleaningSchedule {
  id: string;
  chamber_id: string;
  cleaning_date: string;
  cleaning_time: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  chambers: Chamber;
}

interface ChamberManagementProps {
  onChamberUpdate?: (chamberId: string, status: string) => void;
  onSessionUpdate?: (sessionId: string, status: string) => void;
}

export default function ChamberManagement({ 
  onChamberUpdate, 
  onSessionUpdate 
}: ChamberManagementProps) {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [sessions, setSessions] = useState<ChamberSession[]>([]);
  const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [showAddChamber, setShowAddChamber] = useState(false);
  const [showAddCleaning, setShowAddCleaning] = useState(false);
  const [newChamber, setNewChamber] = useState({
    name: '',
    description: '',
    status: 'available' as const,
    location: 'atmos',
    capacity: 4
  });
  const [newCleaning, setNewCleaning] = useState({
    chamber_id: '',
    cleaning_date: '',
    cleaning_time: '',
    duration: 30
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chambersRes, sessionsRes, cleaningRes] = await Promise.all([
          fetch('/api/admin/chambers'),
          fetch('/api/admin/chamber-sessions'),
          fetch('/api/admin/cleaning-schedules')
        ]);

        if (chambersRes.ok) {
          const chambersData = await chambersRes.json();
          setChambers(chambersData.data || []);
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData.data || []);
        }

        if (cleaningRes.ok) {
          const cleaningData = await cleaningRes.json();
          setCleaningSchedules(cleaningData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle chamber status update
  const handleChamberStatusUpdate = async (chamberId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/chambers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chamberId, status: newStatus })
      });

      if (response.ok) {
        setChambers(prev => prev.map(chamber => 
          chamber.id === chamberId 
            ? { ...chamber, status: newStatus as any }
            : chamber
        ));
        
        onChamberUpdate?.(chamberId, newStatus);
      }
    } catch (error) {
      console.error('Error updating chamber status:', error);
    }
  };

  // Handle session status update
  const handleSessionStatusUpdate = async (sessionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/chamber-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, status: newStatus })
      });

      if (response.ok) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: newStatus as any }
            : session
        ));
        
        onSessionUpdate?.(sessionId, newStatus);
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  // Handle add chamber
  const handleAddChamber = async () => {
    try {
      const response = await fetch('/api/admin/chambers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChamber)
      });

      if (response.ok) {
        const newChamberData = await response.json();
        setChambers(prev => [...prev, newChamberData.data]);
        setNewChamber({
          name: '',
          description: '',
          status: 'available',
          location: 'atmos',
          capacity: 4
        });
        setShowAddChamber(false);
      }
    } catch (error) {
      console.error('Error adding chamber:', error);
    }
  };

  // Handle delete chamber
  const handleDeleteChamber = async (chamberId: string) => {
    if (!confirm('Are you sure you want to delete this chamber?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/chambers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chamberId })
      });

      if (response.ok) {
        setChambers(prev => prev.filter(chamber => chamber.id !== chamberId));
      }
    } catch (error) {
      console.error('Error deleting chamber:', error);
    }
  };

  // Handle add cleaning schedule
  const handleAddCleaning = async () => {
    try {
      const response = await fetch('/api/admin/cleaning-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCleaning)
      });

      if (response.ok) {
        const newCleaningData = await response.json();
        setCleaningSchedules(prev => [...prev, newCleaningData.data]);
        setNewCleaning({
          chamber_id: '',
          cleaning_date: '',
          cleaning_time: '',
          duration: 30
        });
        setShowAddCleaning(false);
      }
    } catch (error) {
      console.error('Error adding cleaning schedule:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_use':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      {/* Chamber Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chamber Management</h2>
          <button
            onClick={() => setShowAddChamber(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Chamber
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chambers.map(chamber => (
            <div
              key={chamber.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{chamber.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{chamber.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chamber.status)}`}>
                    {chamber.status}
                  </span>
                  <button
                    onClick={() => handleDeleteChamber(chamber.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    title="Delete Chamber"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <p>Location: {chamber.location}</p>
                <p>Capacity: {chamber.capacity} people</p>
              </div>

              <div className="space-y-2">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleChamberStatusUpdate(chamber.id, 'available')}
                    className={`flex-1 text-xs px-2 py-1 rounded ${
                      chamber.status === 'available'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                    }`}
                    title="Set as Available"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleChamberStatusUpdate(chamber.id, 'in_use')}
                    className={`flex-1 text-xs px-2 py-1 rounded ${
                      chamber.status === 'in_use'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
                    }`}
                    title="Set as In Use"
                  >
                    In Use
                  </button>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleChamberStatusUpdate(chamber.id, 'maintenance')}
                    className={`flex-1 text-xs px-2 py-1 rounded ${
                      chamber.status === 'maintenance'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                    }`}
                    title="Set as Maintenance"
                  >
                    Maintenance
                  </button>
                  <button
                    onClick={() => handleChamberStatusUpdate(chamber.id, 'cleaning')}
                    className={`flex-1 text-xs px-2 py-1 rounded ${
                      chamber.status === 'cleaning'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                    }`}
                    title="Set as Cleaning"
                  >
                    Cleaning
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chamber Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Chamber Sessions</h2>
        
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {session.chambers.name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>{session.bookings.first_name} {session.bookings.last_name}</strong></p>
                    <p>{session.session_date} at {session.session_time}</p>
                    <p>{session.duration} min • {session.bookings.group_size} people</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <select
                    value={session.status}
                    onChange={(e) => handleSessionStatusUpdate(session.id, e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No chamber sessions scheduled
            </div>
          )}
        </div>
      </div>

      {/* Cleaning Schedules */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cleaning Schedules</h2>
          <button
            onClick={() => setShowAddCleaning(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Cleaning
          </button>
        </div>
        
        <div className="space-y-4">
          {cleaningSchedules.map(cleaning => (
            <div
              key={cleaning.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cleaning.chambers.name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(cleaning.status)}`}>
                      {cleaning.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{cleaning.cleaning_date} at {cleaning.cleaning_time}</p>
                    <p>Duration: {cleaning.duration} minutes</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {cleaningSchedules.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No cleaning schedules
            </div>
          )}
        </div>
      </div>

      {/* Add Chamber Modal */}
      {showAddChamber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Chamber</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newChamber.name}
                  onChange={(e) => setNewChamber({ ...newChamber, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newChamber.description}
                  onChange={(e) => setNewChamber({ ...newChamber, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={newChamber.capacity}
                  onChange={(e) => setNewChamber({ ...newChamber, capacity: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddChamber(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChamber}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Chamber
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cleaning Modal */}
      {showAddCleaning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Cleaning Schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chamber
                </label>
                <select
                  value={newCleaning.chamber_id}
                  onChange={(e) => setNewCleaning({ ...newCleaning, chamber_id: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Chamber</option>
                  {chambers.map(chamber => (
                    <option key={chamber.id} value={chamber.id}>
                      {chamber.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newCleaning.cleaning_date}
                  onChange={(e) => setNewCleaning({ ...newCleaning, cleaning_date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={newCleaning.cleaning_time}
                  onChange={(e) => setNewCleaning({ ...newCleaning, cleaning_time: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newCleaning.duration}
                  onChange={(e) => setNewCleaning({ ...newCleaning, duration: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddCleaning(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCleaning}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Cleaning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 