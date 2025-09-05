export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="min-h-screen bg-gray-100 dark:bg-gray-800 py-20 px-8 relative z-10 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-16 text-gray-900 dark:text-white">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tap</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Simply tap your phone on the NFC tag at the vendor&apos;s station.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
              <span className="text-2xl font-bold text-green-600 dark:text-green-300">2</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Confirm</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Review and confirm the transaction details on your phone.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">3</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Go</h3>
            <p className="text-gray-600 dark:text-gray-300">
              That&apos;s it! Your payment is complete. Enjoy your purchase.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
