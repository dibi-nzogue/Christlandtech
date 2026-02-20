import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

// ✅ Images SANS texte
import heroDesk from "../assets/images/Imagehero1.webp"; // bureau
import heroIt from "../assets/images/Imagehero2.webp";   // services IT
import heroTech from "../assets/images/Imagehero3.jpg";  // produits tech

type SlideLayout = "center" | "topCenter" | "left";

type SlideConfig = {
  title: string;
  description: string;
  image: string;
  layout: SlideLayout;
  titleClass?: string;
  descClass?: string;

  // ✅ option 1: cover + position par slide
  fit?: "cover" | "contain";
  position?: React.CSSProperties["objectPosition"]; // ex: "50% 20%"
  bgClass?: string; // utile si contain
};

const SLIDER_ID = "hero-main-carousel";

const slides: SlideConfig[] = [
  {
    image: heroDesk,
    layout: "left",
    title: "Des services IT pour booster votre performance",
    description:
      "Installation, maintenance, support informatique et solutions sur mesure...",
    titleClass: "text-black",
    descClass: "text-black/70",

    // ✅ (option 1) on garde cover, mais on remonte un peu le cadrage si besoin
    fit: "cover",
    position: "50% 35%",
  },
  {
    image: heroIt,
    layout: "center",
    title: "Decouvrez l’univers de la technologie",
    description:
      "Produits, services et solutions technologiques pour les particuliers et les entreprises.",
    titleClass: "text-white",
    descClass: "text-black/90",

    // ✅ IMPORTANT: ici on remonte clairement pour ne pas couper la tête
    // Tu peux tester 20%, 15%, 10% selon ton image
    fit: "cover",
    position: "50% 15%",
  },
  {
    image: heroTech,
    layout: "topCenter",
    title: "Decouvrez l’univers de la Tehnologie",
    description: "Retrouvez les meilleures marques au meilleur prix.",
    titleClass: "text-black",
    descClass: "text-white",

    fit: "cover",
    position: "50% 25%",
  },
];

const HeroCarousel: React.FC = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  useEffect(() => {
    if (!isInView || !instanceRef.current) return;
    const slider = instanceRef.current;
    const interval = setInterval(() => slider.next(), 5000);
    return () => clearInterval(interval);
  }, [instanceRef, isInView]);

  const overlayByLayout = (layout: SlideLayout) => {
    if (layout === "center") {
      return "absolute inset-0 flex flex-col items-center justify-center text-center px-6";
    }
    if (layout === "topCenter") {
      return "absolute inset-0 flex flex-col items-center justify-start text-center px-6 pt-[9vh] sm:pt-[10vh] md:pt-[12vh] lg:pt-[14vh]";
    }
    return "absolute inset-0 flex flex-col items-start justify-center text-left px-6 sm:px-10 md:px-14 lg:px-40 pt-20";
  };

  const titleClassByLayout = (layout: SlideLayout) => {
    if (layout === "left") {
      return "font-extrabold leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-[16ch]";
    }
    if (layout === "topCenter") {
      return "font-extrabold leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl";
    }
    return "font-extrabold leading-[1.05] text-3xl sm:text-4xl md:text-6xl lg:text-7xl max-w-5xl";
  };

  const descClassByLayout = (layout: SlideLayout) => {
    if (layout === "left") {
      return "font-semibold mt-4 md:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl max-w-xl";
    }
    if (layout === "topCenter") {
      return "font-semibold mt-4 md:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl";
    }
    return "font-semibold mt-4 md:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl";
  };

  return (
    <section
      ref={containerRef}
      aria-label="Carrousel principal"
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
                className={`keen-slider__slide relative ${slide.bgClass ?? ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${slides.length}`}
              >
                <img
                  src={slide.image}
                  alt=""
                  width={1920}
                  height={1080}
                  loading={isFirst ? "eager" : "lazy"}
                  fetchPriority={isFirst ? "high" : "auto"}
                  decoding="async"
                  style={{
                    objectPosition: slide.position ?? "50% 20%",
                  }}
                  className={`
                    w-screen max-w-none
                    h-[70vh] md:h-[75vh] lg:h-[calc(100vh-140px)]
                    ${slide.fit === "contain" ? "object-contain" : "object-cover"}
                  `}
                />

                {/* overlays */}
                {slide.layout === "center" && (
                  <div className="absolute inset-0 bg-black/5" />
                )}
                {slide.layout === "topCenter" && <div className="absolute inset-0" />}
                {slide.layout === "left" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-white/5 to-transparent" />
                )}

                <div className={overlayByLayout(slide.layout)}>
                  <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className={`${titleClassByLayout(slide.layout)} ${
                      slide.titleClass ?? "text-white"
                    }`}
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className={`${descClassByLayout(slide.layout)} ${
                      slide.descClass ?? "text-white/90"
                    }`}
                  >
                    {slide.description}
                  </motion.p>

                  {slide.layout === "left" && (
                    <div className="sm:hidden w-full text-center mt-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2"
          role="tablist"
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              aria-label={`Aller au slide ${idx + 1}`}
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