"use client";

import SmartHeader from "./SmartHeader";

export default function CustomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <SmartHeader />
      <main className="flex-grow pt-16 relative z-10">{children}</main>
      {/* Custom Footer with SOLID DARK background regardless of theme */}
      <footer className="bg-gray-900 border-t border-gray-700 py-8 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-300">© 2025 Tap&Go Pay. Built with ❤️ for ETHAccra Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
