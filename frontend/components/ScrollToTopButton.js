import React, { useState, useEffect, useRef } from "react";
import { FaArrowAltCircleUp } from "react-icons/fa";

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const timeoutRef = useRef(null); // ✅ Persist timeout across renders

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        setShowButton(false); // Hide at the top
      } else if (currentScrollY < lastScrollY) {
        setShowButton(true); // Show when scrolling up

        // ✅ Clear previous timeout before setting a new one
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => setShowButton(false), 5000);
      } else {
        setShowButton(false); // Hide when scrolling down
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [lastScrollY]);

  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setShowButton(false);
      }}
      className={`z-50 fixed bottom-10 right-10 bg-slate-800 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center
        ${
          showButton
            ? "opacity-75 scale-100"
            : "opacity-0 scale-0 pointer-events-none"
        } 
        hover:opacity-100 hover:scale-105 
        active:scale-110`}
    >
      <FaArrowAltCircleUp className="text-5xl" />
    </button>
  );
};

export default ScrollToTopButton;
