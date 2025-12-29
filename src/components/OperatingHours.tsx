"use client";

interface OperatingHoursProps {
  className?: string;
}

export function OperatingHours({ className = "" }: OperatingHoursProps) {
  const hours = [
    { day: "Monday", hours: "9:00 AM - 6:00 PM", isOpen: true },
    { day: "Tuesday", hours: "9:00 AM - 6:00 PM", isOpen: true },
    { day: "Wednesday", hours: "11:00 AM - 6:00 PM", isOpen: true },
    { day: "Thursday", hours: "9:00 AM - 6:00 PM", isOpen: true },
    { day: "Friday", hours: "9:00 AM - 3:00 PM", isOpen: true },
    { day: "Saturday", hours: "9:00 AM - 1:00 PM", isOpen: true },
    { day: "Sunday", hours: "Closed", isOpen: false },
  ];

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const currentDay = new Date().getDay();

  return (
    <div className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Operating Hours
      </h2>
      <div className="space-y-2">
        {hours.map((schedule, index) => {
          const isToday = index === (currentDay === 0 ? 6 : currentDay - 1);
          return (
            <div
              key={schedule.day}
              className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                isToday
                  ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                  : "hover:bg-gray-100 dark:hover:bg-gray-600/30"
              }`}
            >
              <span
                className={`font-medium ${
                  isToday
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {schedule.day}
                {isToday && (
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </span>
              <span
                className={`${
                  schedule.isOpen
                    ? isToday
                      ? "text-blue-900 dark:text-blue-100 font-medium"
                      : "text-gray-600 dark:text-gray-400"
                    : "text-red-600 dark:text-red-400 font-medium"
                }`}
              >
                {schedule.hours}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Please book your appointment during our operating hours
        </p>
      </div>
    </div>
  );
}
