"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen to route changes
    handleComplete(); // Complete any previous loading

    // You can add event listeners for route changes here
    // For now, we'll use a simple timeout-based approach

    return () => {
      // Cleanup
    };
  }, [pathname, searchParams]);

  return isLoading;
}
