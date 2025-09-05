"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function PersistentDownArrow() {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = scrollTop / (documentHeight - windowHeight);

      setIsVisible(scrollPercentage < 0.9);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible || !mounted) return null;

  // Choose arrow color based on theme and background
  const arrowColor = theme === "dark" ? "text-white" : "text-gray-900";
  const arrowBg = theme === "dark" ? "bg-black/20" : "bg-white/20";

  return (
    <div
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce ${arrowBg} backdrop-blur-sm rounded-full p-2`}
    >
      <svg className={`w-8 h-8 ${arrowColor} drop-shadow-md`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
}
