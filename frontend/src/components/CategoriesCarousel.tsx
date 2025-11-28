// src/components/CategoriesCarousel.tsx
import React, { useRef } from "react";
import Slider from "react-slick";
import { motion, useInView } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useTopCategories1, type ApiCategory } from "../hooks/useFetchQuery";

// ✅ Fallback inline
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
  const sliderRef = useRef<Slider | null>(null);

  const { data: cats, loading, error } = useTopCategories1();
  const items: ApiCategory[] = cats ?? [];

  /** ========= Slider vraiment responsive ========= */
  // remplace entièrement ton const settings = { ... } par :
const settings = {
  dots: false,
  infinite: false,
  speed: 400,
  swipeToSlide: true,
  variableWidth: false,
  centerMode: false,
  adaptiveHeight: false,

  // ✅ Desktop / md+ : 4 cartes
  slidesToShow: 4,
  slidesToScroll: 1,

  responsive: [
    // < 768px (en dessous de md) : 2 cartes
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    // < 480px : 1 carte
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};


  // Framer Motion
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.45 },
    }),
  };

  return (
    <div className="bg-white py-8" ref={ref}>
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
            {t("categorie")}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Précédent"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Suivant"
            >
              <FaArrowRight />
            </button>
          </div>
        </motion.div>

        {/* Erreur */}
        {error && <p className="mb-4 text-red-600">{error}</p>}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-2 sm:px-3">
                <div className="flex flex-col items-center rounded-xl bg-gray-50 p-6 shadow">
                  <div className="mb-3 aspect-square w-24 rounded-lg bg-gray-200" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Carousel */}
        {!loading && items.length > 0 && (
          <Slider ref={sliderRef} {...settings}>
            {items.map((cat, i) => (
              <div key={cat.id} className="px-2 sm:px-3">
                <motion.div
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className="relative flex h-full flex-col items-center 
                             rounded-xl bg-gray-50 p-5 sm:p-6 shadow-md hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-24 md:w-28 lg:w-32 overflow-hidden rounded-lg ring-1 ring-gray-200 bg-white/70">
                    <motion.img
                      src={cat.image_url || FALLBACK_SVG}
                      alt={cat.nom}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ scale: 0.94, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.45, delay: i * 0.06 }}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
                      }}
                    />
                  </div>

                 {/* Titre : parfaitement centré dans sa zone */}
<div className="mt-3 w-full px-2 min-h-[56px] sm:min-h-[56px] flex items-center justify-center">
  <p
    className="text-center
               text-[13px] sm:text-sm md:text-base leading-snug
               break-words hyphens-none sm:hyphens-auto
               overflow-hidden [display:-webkit-box] [WebkitBoxOrient:vertical]
               [WebkitLineClamp:3] sm:[WebkitLineClamp:2]"
    title={cat.nom}
  >
    {cat.nom}
  </p>
</div>

                </motion.div>
              </div>
            ))}
          </Slider>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-gray-500">{t("Aucune catégorie disponible")}</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesCarousel;
