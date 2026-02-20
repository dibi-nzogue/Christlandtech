import React, { useRef, useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { motion, useInView } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  useTopCategories1,
  type ApiCategory,
  media,
} from "../hooks/useFetchQuery";
import GlobalLoader from "./GlobalLoader";

const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#e5e7eb"/>
      <stop offset="100%" stop-color="#f3f4f6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="#9ca3af" text-anchor="middle" font-family="Arial, Helvetica, sans-serif">
    <circle cx="128" cy="96" r="36" fill="#d1d5db"/>
    <rect x="64" y="150" width="128" height="18" rx="9" fill="#d1d5db"/>
  </g>
</svg>`);

const CategoriesCarousel: React.FC = () => {
  const { t } = useTranslation();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 640);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { data: cats, loading, error } = useTopCategories1();
  const items: ApiCategory[] = cats ?? [];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: { perView: 2, spacing: 16 },
    breakpoints: {
      "(max-width: 379px)": { slides: { perView: 1, spacing: 12 } },
      "(min-width: 640px)": { slides: { perView: 3, spacing: 16 } },
      "(min-width: 900px)": { slides: { perView: 4, spacing: 18 } },
      "(min-width: 1200px)": { slides: { perView: 5, spacing: 20 } },
    },
    created(slider) {
      setLoaded(true);
      setCurrentSlide(slider.track.details.rel);
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.45 },
    }),
  };

  const canPrev = loaded ? currentSlide > 0 : false;
  const canNext = loaded
    ? currentSlide < (instanceRef.current?.track.details?.maxIdx ?? 0)
    : false;

  return (
    <section
      className="bg-white py-8"
      ref={sectionRef}
      aria-labelledby="categories-carousel-title"
      role="region"
    >
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-between gap-3"
        >
          <h2
            id="categories-carousel-title"
            className="text-lg sm:text-xl md:text-2xl font-semibold"
          >
            {t("categorie")}
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => instanceRef.current?.prev()}
              disabled={!canPrev}
              className={[
                "p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8E8]",
                canPrev ? "hover:bg-gray-200" : "opacity-40 cursor-not-allowed",
              ].join(" ")}
              aria-label="Afficher les catégories précédentes"
            >
              <FaArrowLeft aria-hidden="true" />
            </button>

            <button
              onClick={() => instanceRef.current?.next()}
              disabled={!canNext}
              className={[
                "p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8E8]",
                canNext ? "hover:bg-gray-200" : "opacity-40 cursor-not-allowed",
              ].join(" ")}
              aria-label="Afficher les catégories suivantes"
            >
              <FaArrowRight aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        {error && (
          <p className="mb-4 text-red-600" role="status">
            {error}
          </p>
        )}

        {loading && items.length === 0 && (
          <div className="py-10 flex items-center justify-center">
            <GlobalLoader />
          </div>
        )}

        {!loading && items.length > 0 && (
          // ✅ IMPORTANT: on ajoute de l’espace vertical pour éviter la coupe
          <div className="pb-10 pt-4">
            {/* ✅ IMPORTANT: wrapper overflow-visible pour laisser respirer le hover */}
            <div className="overflow-visible">
              <div
                ref={sliderRef}
                // ✅ IMPORTANT: overflow-visible ici aussi
                className="keen-slider overflow-visible"
                aria-live="polite"
                aria-roledescription="carrousel de catégories"
              >
                {items.map((cat, i) => {
                  const rawImage = cat.image_url || (cat as any).image || "";
                  const imgSrc = rawImage ? media(rawImage) : FALLBACK_SVG;

                  const eagerLimit = isMobile ? 2 : 1;
                  const shouldEagerLoad = i < eagerLimit;

                  return (
                    <div
                      key={cat.id}
                      // ✅ IMPORTANT: overflow-visible sur chaque slide
                      className="keen-slider__slide px-2 sm:px-3 overflow-y-visible"
                      role="group"
                      aria-label={`${cat.nom}`}
                    >
                      <motion.div
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        whileHover={{ y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 18,
                        }}
                        className="
                          group relative flex flex-col items-center rounded-2xl
                          bg-white/80 backdrop-blur
                          p-4 sm:p-5 min-h-[230px]
                          border border-gray-200/70
                          shadow-[0_8px_22px_rgba(0,0,0,0.06)]
                          hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]
                          focus-within:ring-2 focus-within:ring-[#00A8E8]/70
                          overflow-hidden
                        "
                      >
                        {/* halo bleu */}
                        <div
                          className="
                            pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100
                            transition-opacity duration-300
                            bg-[radial-gradient(circle_at_50%_30%,rgba(0,168,232,0.22),transparent_60%)]
                          "
                        />

                        {/* shine */}
                        <div
                          className="
                            pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
                            transition-[opacity,transform]
                            bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.45)_40%,transparent_70%)]
                            translate-x-[-30%] group-hover:translate-x-[30%]
                          "
                          style={{
                            transitionDuration: "300ms, 700ms",
                            transitionTimingFunction: "ease, ease",
                          }}
                        />

                        {/* Image */}
                        <div
                          className="
                            relative aspect-square w-24 md:w-28 lg:w-32
                            overflow-hidden rounded-xl
                            ring-1 ring-gray-200
                            group-hover:ring-[#00A8E8]/40
                            transition
                            bg-gray-50
                          "
                        >
                          <motion.img
                            src={imgSrc}
                            alt={cat.nom}
                            className="
                              absolute inset-0 h-full w-full object-cover
                              transition-transform duration-500
                              group-hover:scale-[1.10]
                            "
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={
                              isInView ? { scale: 1, opacity: 1 } : undefined
                            }
                            transition={{
                              duration: 0.45,
                              delay: i * 0.06,
                            }}
                            loading={shouldEagerLoad ? "eager" : "lazy"}
                            fetchPriority={shouldEagerLoad ? "high" : "auto"}
                            width={300}
                            height={300}
                            decoding="async"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
                            }}
                          />

                          {/* overlay */}
                          <div
                            className="
                              absolute inset-0 bg-black/0 group-hover:bg-black/10
                              transition-colors duration-300
                            "
                          />
                        </div>

                        {/* Titre */}
                        <div className="mt-3 w-full flex items-center justify-center min-h-[48px]">
                          <p
                            className="
                              max-w-[11rem] mx-auto text-center
                              text-[13px] sm:text-sm md:text-base
                              leading-snug font-semibold
                              text-gray-900
                              group-hover:text-[#00A8E8]
                              transition-colors
                              break-words
                            "
                            title={cat.nom}
                          >
                            {cat.nom}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-gray-500" role="status">
            {t("categorie.empty") || "Aucune catégorie disponible pour le moment."}
          </p>
        )}
      </div>
    </section>
  );
};

export default CategoriesCarousel;