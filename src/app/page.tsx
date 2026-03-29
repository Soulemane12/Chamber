export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-white mb-4">Site Unavailable</h1>
        <p className="text-gray-400 text-lg">
          Wellnex02.com is currently offline. Please check back later.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
