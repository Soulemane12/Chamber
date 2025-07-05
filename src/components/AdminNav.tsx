interface AdminNavProps {
  activeTab: 'dashboard' | 'users';
  onTabChange: (tab: 'dashboard' | 'users') => void;
}

export default function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
      <div className="min-w-max">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('users')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            User Management
          </button>
        </nav>
      </div>
    </div>
  );
} 