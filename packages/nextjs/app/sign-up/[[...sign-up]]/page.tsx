import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join TapNGo Pay
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your account and start making payments
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300',
                card: 'shadow-none bg-transparent',
                headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white',
                headerSubtitle: 'text-gray-600 dark:text-gray-400',
                socialButtonsBlockButton: 'border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl transition-all duration-300',
                formFieldInput: 'border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-300',
                footerActionLink: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
              }
            }}
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
