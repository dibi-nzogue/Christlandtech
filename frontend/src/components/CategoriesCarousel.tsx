// src/components/CategoriesCarousel.tsx
import React, { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import { motion, useInView } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  useTopCategories1,
  type ApiCategory,
  media,
} from "../hooks/useFetchQuery";
import GlobalLoader from "./GlobalLoader";

// ✅ Fallback inline SVG si pas d'image
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

  const [slidesToShow, setSlidesToShow] = useState<number>(2);

  useEffect(() => {
    const computeSlides = () => {
      if (typeof window === "undefined") return 2;

      const w = window.innerWidth;

      if (w < 380) return 1;
      if (w < 640) return 2;
      if (w < 900) return 3;
      if (w < 1200) return 4;
      return 5;
    };

    setSlidesToShow(computeSlides());

    const handleResize = () => {
      setSlidesToShow(computeSlides());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** ========= Slider ========= */
  const settings = {
    dots: false,
    infinite: false,
    speed: 400,
    swipeToSlide: true,
    variableWidth: false,
    centerMode: false,
    adaptiveHeight: false,
    slidesToShow,
    slidesToScroll: 1,
  };

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

  const isInitialLoading = loading && items.length === 0;

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

        {/* Loader */}
        {isInitialLoading && (
          <div className="py-10 flex items-center justify-center">
            <GlobalLoader />
          </div>
        )}

        {/* Carousel */}
        {!isInitialLoading && !loading && items.length > 0 && (
          <div className="pb-10">
            <Slider ref={sliderRef} {...settings}>
              {items.map((cat, i) => {
                const rawImage = cat.image_url || (cat as any).image || "";
                const imgSrc = rawImage ? media(rawImage) : FALLBACK_SVG;

                return (
                  <div key={cat.id} className="px-2 sm:px-3">
                    <motion.div
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      className="
                        relative flex flex-col items-center
                        rounded-xl bg-gray-50 p-4 sm:p-5
                        shadow-md hover:shadow-lg
                        min-h-[230px]              /* 👈 même hauteur mini pour toutes les cartes */
                      "
                    >
                      {/* Image */}
                      <div className="relative aspect-square w-24 md:w-28 lg:w-32 overflow-hidden rounded-lg ring-1 ring-gray-200 bg-white/70">
                        <motion.img
                          src={imgSrc}
                          alt={cat.nom}
                          className="absolute inset-0 h-full w-full object-cover"
                          initial={{ scale: 0.94, opacity: 0 }}
                          animate={isInView ? { scale: 1, opacity: 1 } : {}}
                          transition={{ duration: 0.45, delay: i * 0.06 }}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (img.src !== FALLBACK_SVG) {
                              img.src = FALLBACK_SVG;
                              
                            }
                          }}
                        />
                      </div>

                      {/* Titre */}
                      <div
                        className="
                          mt-3 w-full flex items-center justify-center
                          h-[48px]        /* 👈 bloc texte de hauteur fixe (1 ou 2 lignes) */
                        "
                      >
                        <p
                          className="max-w-[11rem] mx-auto text-center
                                     text-[13px] sm:text-sm md:text-base
                                     leading-snug font-medium
                                     break-words overflow-hidden text-ellipsis"
                          title={cat.nom}
                        >
                          {cat.nom}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </Slider>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-gray-500">{t("Aucune catégorie disponible")}</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesCarousel;
