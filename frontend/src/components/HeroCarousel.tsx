// src/components/HeroCarousel.tsx
import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import hero from "../assets/images/hero.webp";
import hero1 from "../assets/images/hero1.webp";
import hero2 from "../assets/images/hero2.webp";

type SlideConfig = {
  title: string;
  highlighted: string;
  description: string;
  button: string;
  image: string;
};

const slides: SlideConfig[] = [
  {
    title: "hero.title",
    highlighted: "highlighted",
    description: "hero.description",
    button: "hero.button",
    image: hero,
  },
  {
    title: "hero.title",
    highlighted: "highlighted",
    description: "hero.description",
    button: "hero.button",
    image: hero1,
  },
  {
    title: "hero.title",
    highlighted: "highlighted",
    description: "hero.description",
    button: "hero.button",
    image: hero2,
  },
];

const NextArrow: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    aria-label="Slide suivant"
    className="absolute right-5 top-2/3 md:top-1/2 z-10 cursor-pointer bg-white rounded-full p-2 lg:p-3 text-gray-900 text-sm md:text-md"
    onClick={onClick}
  >
    <FaArrowRight />
  </button>
);

const PrevArrow: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    aria-label="Slide précédent"
    className="absolute left-5 top-2/3 md:top-1/2 z-10 cursor-pointer bg-white rounded-full p-2 lg:p-3 text-gray-900 text-sm md:text-md"
    onClick={onClick}
  >
    <FaArrowLeft />
  </button>
);

const HeroCarousel: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  // Autoplay
  useEffect(() => {
    if (!isInView || !instanceRef.current) return;
    const slider = instanceRef.current;

    const interval = setInterval(() => {
      slider.next();
    }, 5000);

    return () => clearInterval(interval);
  }, [instanceRef, isInView]);

  return (
    <div ref={containerRef}>
      <div className="relative">
        <div ref={sliderRef} className="keen-slider">
          {slides.map((slide, index) => (
            <div key={index} className="keen-slider__slide relative px-2">
              <img
                src={slide.image}
                alt={t(slide.title)}
                width={300}
                height={300}
                loading="lazy"
                className="w-full h-[60vh] md:h-[70vh] object-cover rounded-2xl"
              />

              <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 gap-4 md:gap-10 lg:gap-16">
                <motion.h2
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold text-white mb-4"
                >
                  {t(slide.title)}
                  <span className="text-[#00A9DC]"> {t(slide.highlighted)}</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-white/90 max-w-xl mb-6 text-md md:text-lg lg:text-xl"
                >
                  {t(slide.description)}
                </motion.p>

                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  onClick={() => navigate("/produits")}
                  className="bg-[#00A9DC] text-white px-2 md:px-4 py-1 md:py-2 rounded-md text-md md:text-lg"
                >
                  {t(slide.button)}
                </motion.button>
              </div>
            </div>
          ))}
        </div>

        {/* Flèches */}
        <PrevArrow onClick={() => instanceRef.current?.prev()} />
        <NextArrow onClick={() => instanceRef.current?.next()} />

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 custom-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              aria-label={`Aller au slide ${idx + 1}`}
              aria-current={idx === currentSlide ? "true" : "false"}
              className={`w-2 h-2 rounded-full ${
                idx === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
