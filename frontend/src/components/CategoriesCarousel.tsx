// src/components/CategoriesCarousel.tsx
import React, { useRef } from "react";
import Slider from "react-slick";
import { motion, useInView } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useTopCategories, type ApiCategory } from "../hooks/useFetchQuery";

// ✅ Fallback inline (aucun import d'image locale)
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

  // ⚡️ Récupération depuis ton API (catégories racines)
  const { data: cats, loading, error } = useTopCategories({ level: 1 });

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768,  settings: { slidesToShow: 2 } },
      { breakpoint: 480,  settings: { slidesToShow: 1 } },
    ],
  };

  // Framer Motion
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.55 },
    }),
  };

  const items: ApiCategory[] = cats ?? [];

  return (
    <div className="bg-white py-10" ref={ref}>
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold">{t("categorie")}</h2>
          <div className="flex gap-3">
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Précédent"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Suivant"
            >
              <FaArrowRight />
            </button>
          </div>
        </motion.div>

        {/* Erreur */}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-3">
                <div className="bg-gray-50 rounded-xl shadow-md flex flex-col items-center py-8">
                  <div className="relative aspect-square w-28 md:w-32 rounded-lg overflow-hidden bg-gray-200 animate-pulse mb-4" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Carousel */}
        {!loading && items.length > 0 && (
          <Slider ref={sliderRef} {...settings}>
            {items.map((cat, i) => (
              <div key={cat.id} className="px-3">
                <motion.div
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center py-8 relative"
                >
                  {/* ✅ Wrapper carré + object-cover + crop propre */}
                  <div className="relative aspect-square w-24 md:w-28 lg:w-32 rounded-lg overflow-hidden bg-white/70 ring-1 ring-gray-200">
                    <motion.img
                      src={cat.image_url || FALLBACK_SVG}
                      alt={cat.nom}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.6, delay: i * 0.12 }}
                      whileHover={{ scale: 1.05 }}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
                      }}
                    />
                  </div>

                  <p className="text-center text-base md:text-lg font-medium mt-4 px-2">
                    {cat.nom}
                  </p>
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
