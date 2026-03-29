export default function Home() {
  return (
    <div className="min-h-screen bg-red-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold text-red-100 mb-6">🚨 SITE OFFLINE 🚨</h1>
        <p className="text-red-200 text-xl mb-4">
          wellnex02.com is temporarily unavailable
        </p>
        <p className="text-red-300 text-lg">
          Please check back later.
        </p>
        <p className="text-red-400 text-sm mt-6">
          Emergency deployment: {new Date().toISOString()} - Build {Date.now()}
        </p>
      </div>
    </div>
  );
}
