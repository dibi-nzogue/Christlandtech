import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) setIsVisible(true);
      else setIsVisible(false);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="hover:bg-[#00A9DC] text-[#00A9DC] hover:text-white transition-colors bg-white py-5 px-5 rounded-full text-md shadow-lg hover:shadow-xl shadow-slate-700"
        title="Retour en haut"
      >
        <div className="-rotate-90 text-md">
          <FaArrowRight />
        </div>
      </button>
    </div>
  );
};

export default ScrollToTopButton;
