import { useState, useEffect } from "react";

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmallMobile: boolean; // < 390px
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // >= 768px && < 1024px
  isDesktop: boolean;     // >= 1024px
  isLargeDesktop: boolean;// >= 1440px
}

export function useResponsive(): ResponsiveInfo {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // ensure accurate on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = windowSize;

  return {
    width,
    height,
    isSmallMobile: width < 390,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLargeDesktop: width >= 1440,
  };
}
