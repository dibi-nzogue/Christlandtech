import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
// import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import hero from "../assets/images/Herosection3.jpg";
import hero1 from "../assets/images/HeroSection2.jpg";
import hero2 from "../assets/images/Herosection1.jpg";

type SlideConfig = {
  title: string;
  highlighted: string;
  description: string;
  button: string;
  image: string;
};

const SLIDER_ID = "hero-main-carousel";

const slides: SlideConfig[] = [
  { title: "", highlighted: "", description: "", button: "hero.button", image: hero },
  { title: "", highlighted: "", description: "", button: "hero.button", image: hero1 },
  { title: "", highlighted: "", description: "", button: "hero.button", image: hero2 },
];

// const NextArrow: React.FC<{ onClick: () => void; ariaControls?: string }> = ({
//   onClick,
//   ariaControls,
// }) => (
//   <button
//     type="button"
//     aria-label="Slide suivant"
//     aria-controls={ariaControls}
//     className="absolute right-5 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full p-2 lg:p-3 text-gray-900 text-sm md:text-md"
//     onClick={onClick}
//   >
//     <FaArrowRight />
//   </button>
// );

// const PrevArrow: React.FC<{ onClick: () => void; ariaControls?: string }> = ({
//   onClick,
//   ariaControls,
// }) => (
//   <button
//     type="button"
//     aria-label="Slide précédent"
//     aria-controls={ariaControls}
//     className="absolute left-5 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full p-2 lg:p-3 text-gray-900 text-sm md:text-md"
//     onClick={onClick}
//   >
//     <FaArrowLeft />
//   </button>
// );

const HeroCarousel: React.FC = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  const containerRef = useRef<HTMLElement | null>(null);
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
    <section
      ref={containerRef}
      aria-label={t("hero.carouselLabel") || "Carrousel principal"}
      aria-roledescription="carrousel"
      className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
    >
      <div className="relative w-screen max-w-none overflow-hidden">
        <div
          ref={sliderRef}
          id={SLIDER_ID}
          className="keen-slider"
          aria-live="polite"
        >
          {slides.map((slide, index) => {
            const isFirst = index === 0;

            return (
              <div
                key={index}
                className="keen-slider__slide relative"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${slides.length}`}
              >
                {/* ✅ image plus haute + meilleur cadrage */}
                <img
                  src={slide.image}
                  alt={t(slide.title)}
                  width={1920}
                  height={1080}
                  loading={isFirst ? "eager" : "lazy"}
                  fetchPriority={isFirst ? "high" : "auto"}
                  decoding="async"
                  className="
                    w-screen max-w-none object-cover
                    h-[70vh] md:h-[75vh] lg:h-[calc(100vh-140px)]
                    object-[center_top]
                  "
                />

                {/* ✅ petit overlay léger (optionnel mais rend mieux) */}
                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 gap-4 md:gap-8 lg:gap-10">
                  <motion.h2
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white"
                  >
                    {t(slide.title)}
                    <span className="text-[#00A9DC]"> {t(slide.highlighted)}</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-white/90 max-w-3xl text-base md:text-xl lg:text-2xl"
                  >
                    {t(slide.description)}
                  </motion.p>

                
                </div>
              </div>
            );
          })}
        </div>

        {/* Flèches */}
        {/* <PrevArrow onClick={() => instanceRef.current?.prev()} ariaControls={SLIDER_ID} />
        <NextArrow onClick={() => instanceRef.current?.next()} ariaControls={SLIDER_ID} /> */}

        {/* Dots */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2"
          role="tablist"
          aria-label={t("hero.carouselPagination") || "Navigation du carrousel"}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              aria-label={`${t("hero.goToSlide") || "Aller au slide"} ${idx + 1}`}
              role="tab"
              aria-selected={idx === currentSlide}
              aria-controls={SLIDER_ID}
              className={`w-2.5 h-2.5 rounded-full ${
                idx === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
