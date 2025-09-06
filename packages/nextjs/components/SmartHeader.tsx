"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MoonIcon, SunIcon } from "./ThemeIcons";
import { useTheme } from "next-themes";
import { useUser, useClerk } from '@clerk/nextjs';

/* eslint-disable @next/next/no-html-link-for-pages */

export default function SmartHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const isHomePage = pathname === "/";

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClass = isScrolled
    ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm"
    : "bg-transparent";

  const getTextColor = () => {
    if (isHomePage && !isScrolled) {
      return "text-white drop-shadow-md";
    }
    return "text-gray-900 dark:text-white";
  };

  const getAuthButtonStyles = () => {
    if (isHomePage && !isScrolled) {
      return {
        login: "border-white text-white hover:bg-white hover:text-blue-600",
        signup: "bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700",
      };
    }
    return {
      login: "border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white",
      signup: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
    };
  };

  if (!mounted) return null;

  const textColor = getTextColor();
  const authButtonStyles = getAuthButtonStyles();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 transition-all duration-300 ${headerClass}`}
    >
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-32 h-16 flex items-center justify-center mr-3">
          <Image src="/app_logo.png" alt="TapNGo Pay" width={80} height={64} className="object-contain" />
        </div>
        <h1 className={`text-2xl font-bold ${textColor} drop-shadow-md`}>TapNGo Pay</h1>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <nav className="flex space-x-8">
          <a href="/" className={`transition-colors ${textColor} hover:text-blue-600 dark:hover:text-blue-400`}>
            Home
          </a>
          <a href="#features" className={`transition-colors ${textColor} hover:text-blue-600 dark:hover:text-blue-400`}>
            Features
          </a>
          <a
            href="#how-it-works"
            className={`transition-colors ${textColor} hover:text-blue-600 dark:hover:text-blue-400`}
          >
            How it Works
          </a>
          <a href="#demo" className={`transition-colors ${textColor} hover:text-blue-600 dark:hover:text-blue-400`}>
            Demo
          </a>
        </nav>

        {/* Modern Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 ${theme === "dark" ? "text-orange-500" : "text-blue-500"}`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          {!isLoaded ? (
            <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/user-dashboard')}
                className={`px-5 py-2.5 rounded-full font-medium border-2 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md ${authButtonStyles.login}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${authButtonStyles.signup}`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <a
                href="/sign-in"
                className={`px-5 py-2.5 rounded-full font-medium border-2 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md ${authButtonStyles.login} inline-block text-center`}
              >
                Login
              </a>
              <a
                href="/sign-up"
                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${authButtonStyles.signup} inline-block text-center`}
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
          isHomePage && !isScrolled
            ? "bg-black/30 hover:bg-black/40 backdrop-blur-sm text-white border border-white/20"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        aria-label="Open menu"
      >
        <div className="w-5 h-5 flex items-center justify-center font-semibold">{isMobileMenuOpen ? "✕" : "☰"}</div>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop with better visibility */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel with glassmorphic effect */}
          <div className="absolute top-0 right-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 border-l border-white/20 dark:border-gray-700/30">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Navigation</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-4">
                <a
                  href="/"
                  className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="w-6 h-6">🏠</span>
                  <span className="font-medium">Home</span>
                </a>
                <a
                  href="#features"
                  className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="w-6 h-6">✨</span>
                  <span className="font-medium">Features</span>
                </a>
                <a
                  href="#how-it-works"
                  className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="w-6 h-6">🔄</span>
                  <span className="font-medium">How it Works</span>
                </a>
                <a
                  href="#demo"
                  className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="w-6 h-6">🎮</span>
                  <span className="font-medium">Demo</span>
                </a>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3 mb-6">
                  {!isLoaded ? (
                    <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  ) : user ? (
                    <>
                      <a 
                        href="/user-dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 font-medium text-center"
                      >
                        Dashboard
                      </a>
                      <button 
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <a 
                        href="/sign-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 font-medium text-center"
                      >
                        Login
                      </a>
                      <a 
                        href="/sign-up"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-center"
                      >
                        Sign Up
                      </a>
                    </>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    {theme === "dark" ? (
                      <>
                        <SunIcon />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
