import { useEffect, useRef, useState } from "react";

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const initialScrollY = window.scrollY;
    lastScrollY.current = initialScrollY;
    setIsVisible(initialScrollY <= 50);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isVisible;
}
