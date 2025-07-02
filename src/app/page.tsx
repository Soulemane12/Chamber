import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Chamber</h1>
        </div>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link href="/" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                About
              </Link>
            </li>
            <li>
              <Link href="/booking" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Book Now
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
            Experience the Benefits of <span className="text-blue-600 dark:text-blue-400">Hyperbaric Oxygen Therapy</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-slide-in-up animate-delay-200">
            Enhance your recovery, boost performance, and improve overall wellness with our state-of-the-art hyperbaric chambers.
          </p>
          <div className="mt-10 animate-fade-in animate-delay-300">
            <Link 
              href="/booking" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] active:scale-95"
            >
              Book Your Session
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover-scale transition-all-300 animate-fade-in animate-delay-100">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Efficient Recovery</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Accelerate healing and recovery with increased oxygen levels that help reduce inflammation and promote tissue repair.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover-scale transition-all-300 animate-fade-in animate-delay-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Enhanced Performance</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Improve athletic performance, increase energy levels, and enhance cognitive function through optimal oxygenation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover-scale transition-all-300 animate-fade-in animate-delay-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Wellness Boost</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Support your overall health with sessions that help detoxify your body, strengthen your immune system, and improve sleep quality.
            </p>
          </div>
        </div>

        <div className="text-center animate-fade-in animate-delay-400">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white animate-slide-in-up">Ready to Experience the Benefits?</h2>
          <Link 
            href="/booking" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] active:scale-95 animate-bounce"
          >
            Book Your Session Now
          </Link>
        </div>
      </main>

      <footer className="mt-20 py-8 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Chamber. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
