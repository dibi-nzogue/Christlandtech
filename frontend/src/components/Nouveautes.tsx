// src/components/Nouveautes.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { ArrowRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useLatestProducts } from "../hooks/useFetchQuery";

// Fallback inline si image manquante
const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#e5e7eb"/>
      <stop offset="100%" stop-color="#f3f4f6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="#9ca3af" text-anchor="middle" font-family="Arial, Helvetica, sans-serif">
    <circle cx="240" cy="130" r="46" fill="#d1d5db"/>
    <rect x="150" y="200" width="180" height="22" rx="11" fill="#d1d5db"/>
  </g>
</svg>`);

// Flèches personnalisées
const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-3 md:p-5 cursor-pointer hover:bg-gray-100 transition"
      onClick={onClick}
    >
      <ArrowRight size={18} className="text-gray-700" />
    </div>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 -left-5 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-3 md:p-5 cursor-pointer hover:bg-gray-100 transition rotate-180"
      onClick={onClick}
    >
      <ArrowRight size={18} className="text-gray-700" />
    </div>
  );
};

export default function Nouveautes() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ⚡️ Données API
  const { data: latest, loading, error } = useLatestProducts();

  const settings = useMemo(
    () => ({
      dots: false,
      infinite: (latest?.length ?? 0) > 3,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      centerMode: true,
      centerPadding: "60px",
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 2, centerPadding: "50px" } },
        { breakpoint: 640,  settings: { slidesToShow: 1, centerPadding: "40px" } },
      ],
    }),
    [latest?.length]
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 flex flex-col items-center py-10 bg-white">
      <motion.h2
        className="text-3xl font-bold mb-6 text-gray-900"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {t("new")}
      </motion.h2>

      {/* erreurs / skeleton */}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white shadow-md rounded-2xl p-4">
              <div className="h-40 md:h-60 w-full rounded-2xl bg-gray-200 animate-pulse mb-4" />
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Carrousel Slick */}
      {!loading && (latest?.length ?? 0) > 0 && (
        <div className="relative w-full mb-10">
          <Slider {...settings}>
            {latest!.map((p) => (
              <div key={p.id} className="px-1 md:px-3">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.8 }}
                  className="relative bg-white shadow-md rounded-2xl my-5 p-4 flex flex-col justify-between items-start gap-5 md:gap-8 hover:shadow-lg transition-shadow h-[500px] md:h-auto"
                >
                  <img
                    src={p.image || FALLBACK_SVG}
                    alt={p.name}
                    className="h-40 md:h-60 object-cover w-full mb-4 rounded-2xl"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
                    }}
                  />

                  <h4 className="text-sm text-gray-500">
                    {p.brand?.nom || ""}
                  </h4>

                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    {p.specs ? (
                      <p className="text-sm text-gray-600 mb-2">{p.specs}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center space-x-2">
                    {p.price ? (
                      <span className="font-bold text-gray-900">Fcfa {p.price}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Prix indisponible</span>
                    )}
                  </div>

                  {p.state && (
                    <div className="mt-2 md:mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl text-sm font-medium w-full text-center">
                      État&nbsp;: {p.state}
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Bouton */}
      <motion.button
        onClick={() => navigate("/Produits")}
        className="bg-[#00A9DC] text-white px-3 md:px-6 py-2 md:py-3 rounded-2xl font-semibold hover:bg-sky-600 transition-colors mt-5 md:mt-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {t("pdt")}
      </motion.button>
    </div>
  );
}
