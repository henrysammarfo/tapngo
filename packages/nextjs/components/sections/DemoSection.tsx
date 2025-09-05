export default function DemoSection() {
  return (
    <section id="demo" className="min-h-screen bg-white dark:bg-gray-900 py-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">See How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the simplicity and speed of Tap&Go Pay in action with our interactive demo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Seamless Payments in Seconds</h3>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 dark:text-blue-300 text-sm">✓</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Just tap your phone to any payment terminal</p>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 dark:text-blue-300 text-sm">✓</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Works even without internet connection</p>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 dark:text-blue-300 text-sm">✓</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Secure authentication with biometrics</p>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 dark:text-blue-300 text-sm">✓</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Instant transaction confirmation</p>
              </div>
            </div>

            {/* Watch Demo Button */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Watch Full Demo
            </button>
          </div>

          {/* Right Side - Video Placeholder */}
          <div className="relative">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-video flex items-center justify-center p-8 shadow-lg">
              <div className="text-center">
                {/* Play Button Icon */}
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                {/* Coming Soon Text */}
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Demo Video Coming Soon</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  We&apos;re preparing an amazing demo for you
                </p>
              </div>
            </div>

            {/* Optional: Add a subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none"></div>
          </div>
        </div>

        {/* Additional Call-to-Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-6">Ready to experience the future of payments?</p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
}
