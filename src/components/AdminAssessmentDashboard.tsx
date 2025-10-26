"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

interface AssessmentData {
  id: string;
  assessment_date: string;
  assessment_time: string;
  first_name: string;
  last_name: string;
  pain_level: number;
  stress_level: number;
  focus_level: number;
  happiness_level: number;
  created_at: string;
  user_email?: string;
  booking_date?: string;
  booking_time?: string;
  booking_duration?: string;
}

export function AdminAssessmentDashboard() {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessment_summary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAssessments(data || []);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Time',
      'First Name',
      'Last Name',
      'Pain Level',
      'Stress Level',
      'Focus Level',
      'Happiness Level',
      'User Email',
      'Booking Date',
      'Booking Time',
      'Booking Duration',
      'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...assessments.map(assessment => [
        assessment.assessment_date,
        assessment.assessment_time,
        `"${assessment.first_name}"`,
        `"${assessment.last_name}"`,
        assessment.pain_level,
        assessment.stress_level,
        assessment.focus_level,
        assessment.happiness_level,
        assessment.user_email || '',
        assessment.booking_date || '',
        assessment.booking_time || '',
        assessment.booking_duration || '',
        assessment.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getAverageScores = () => {
    if (assessments.length === 0) return null;
    
    const totals = assessments.reduce((acc, assessment) => ({
      pain: acc.pain + assessment.pain_level,
      stress: acc.stress + assessment.stress_level,
      focus: acc.focus + assessment.focus_level,
      happiness: acc.happiness + assessment.happiness_level,
    }), { pain: 0, stress: 0, focus: 0, happiness: 0 });

    return {
      pain: (totals.pain / assessments.length).toFixed(1),
      stress: (totals.stress / assessments.length).toFixed(1),
      focus: (totals.focus / assessments.length).toFixed(1),
      happiness: (totals.happiness / assessments.length).toFixed(1),
    };
  };

  const averageScores = getAverageScores();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading assessments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Assessments</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={fetchAssessments} className="bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Assessment Dashboard
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={fetchAssessments}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Refresh
          </Button>
          <Button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      {averageScores && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Average Pain Level</h3>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{averageScores.pain}/10</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-700 dark:text-orange-300">Average Stress Level</h3>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{averageScores.stress}/10</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-700 dark:text-green-300">Average Focus Level</h3>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{averageScores.focus}/10</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">Average Happiness Level</h3>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{averageScores.happiness}/10</p>
          </div>
        </div>
      )}

      {/* Assessments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Pain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Focus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Happiness
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {assessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <div>
                    <div className="font-medium">{assessment.assessment_date}</div>
                    <div className="text-gray-500 dark:text-gray-400">{assessment.assessment_time}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <div>
                    <div className="font-medium">{assessment.first_name} {assessment.last_name}</div>
                    {assessment.user_email && (
                      <div className="text-gray-500 dark:text-gray-400">{assessment.user_email}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(assessment.pain_level / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{assessment.pain_level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(assessment.stress_level / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{assessment.stress_level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(assessment.focus_level / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{assessment.focus_level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(assessment.happiness_level / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{assessment.happiness_level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    onClick={() => setSelectedAssessment(assessment)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assessments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No assessments found.</p>
        </div>
      )}

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Assessment Details
              </h3>
              <Button
                onClick={() => setSelectedAssessment(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <p className="text-gray-900 dark:text-white">{selectedAssessment.assessment_date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                  <p className="text-gray-900 dark:text-white">{selectedAssessment.assessment_time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedAssessment.first_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedAssessment.last_name}</p>
                </div>
                {selectedAssessment.user_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedAssessment.user_email}</p>
                  </div>
                )}
                {selectedAssessment.booking_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Booking Date</label>
                    <p className="text-gray-900 dark:text-white">{selectedAssessment.booking_date}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pain Level: {selectedAssessment.pain_level}/10
                  </label>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(selectedAssessment.pain_level / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stress Level: {selectedAssessment.stress_level}/10
                  </label>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(selectedAssessment.stress_level / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Focus Level: {selectedAssessment.focus_level}/10
                  </label>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(selectedAssessment.focus_level / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Happiness Level: {selectedAssessment.happiness_level}/10
                  </label>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(selectedAssessment.happiness_level / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedAssessment.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
