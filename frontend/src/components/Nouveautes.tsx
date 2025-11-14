// src/components/Nouveautes.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { ArrowRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useLatestProducts } from "../hooks/useFetchQuery";

/* Image de secours */
const ALL_KEY = "__ALL__";
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

/* Flèches (affichées quand on a ≥2 cartes visibles) */
const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      aria-label="Next"
      className="flex absolute top-1/2 -translate-y-1/2 right-2 sm:-right-4
                 z-10 bg-white shadow-md rounded-full p-2 sm:p-3 md:p-5
                 cursor-pointer hover:bg-gray-100 transition"
    >
      <ArrowRight size={18} className="text-gray-700" />
    </div>
  );
};
const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      aria-label="Previous"
      className="flex absolute top-1/2 -translate-y-1/2 left-2 sm:-left-4
                 z-10 bg-white shadow-md rounded-full p-2 sm:p-3 md:p-5
                 cursor-pointer hover:bg-gray-100 transition rotate-180"
    >
      <ArrowRight size={18} className="text-gray-700" />
    </div>
  );
};

/** Hook: 1 / 2 / 3 colonnes selon la largeur */
function useVisibleSlides() {
  const compute = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 0;
    if (w >= 1024) return 3; // desktop
    if (w >= 640) return 2;  // tablettes
    return 1;                // mobile
  };
  const [n, setN] = useState<number>(compute);

  useEffect(() => {
    const onResize = () => setN(compute());
    window.addEventListener("resize", onResize);
    const id = setTimeout(onResize, 0); // kick initial
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return n;
}

export default function Nouveautes() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: latest, loading, error } = useLatestProducts();

  /* Onglets */
  const [activeTab, setActiveTab] = useState<string>(ALL_KEY);
  const tabs = useMemo(() => {
    if (!latest?.length) return [ALL_KEY];
    const unique = Array.from(
      new Set(latest.map((p) => p.category?.nom).filter((c): c is string => !!c))
    );
    return [ALL_KEY, ...unique];
  }, [latest]);

  /* Filtrage */
  const filtered = useMemo(() => {
    if (!latest) return [];
    if (activeTab === ALL_KEY) return latest;
    return latest.filter((p) => p.category?.nom === activeTab || p.categorie?.nom === activeTab);
  }, [latest, activeTab]);

  /* Pilotage robuste des colonnes */
  const visibleSlides = useVisibleSlides();
  const slidesToShow = Math.min(visibleSlides, Math.max(1, filtered?.length || 1));
  const showArrows = visibleSlides >= 2 && (filtered?.length || 0) > 1;
  const autoPlayMobile = visibleSlides === 1 && (filtered?.length || 0) > 1;

  // re-init slick si nb de colonnes change
  const sliderKey = `nv-${visibleSlides}-${filtered?.length || 0}`;

  const settings = {
    dots: false,
    infinite: (filtered?.length ?? 0) > slidesToShow,
    speed: 600,
    swipeToSlide: true,
    variableWidth: false,
    centerMode: false,
    centerPadding: "0px",

    slidesToShow,
    slidesToScroll: 1,

    arrows: showArrows,
    nextArrow: showArrows ? <NextArrow /> : undefined,
    prevArrow: showArrows ? <PrevArrow /> : undefined,

    autoplay: autoPlayMobile,
    autoplaySpeed: 2500,
    pauseOnHover: false,
    pauseOnFocus: false,
  } as const;

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 flex flex-col items-center py-10 bg-white">
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {t("new")}
      </motion.h2>

      {/* Onglets */}
      <motion.div
        className="flex flex-wrap gap-2 md:gap-4 mb-6 justify-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-medium transition-all ${
              activeTab === tab ? "bg-gray-200 text-black" : "text-gray-500 hover:text-black"
            }`}
          >
            {tab === ALL_KEY ? t("see.all") : tab}
          </button>
        ))}
      </motion.div>

      {/* Erreur / chargement */}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white shadow-md rounded-2xl p-4">
              <div className="aspect-[16/10] bg-gray-200 animate-pulse rounded-2xl mb-4" />
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Carrousel */}
      {!loading && (filtered?.length ?? 0) > 0 && (
        <div className="relative w-full mb-10">
          {/* Hauteurs homogènes sans toucher aux largeurs calculées par Slick */}
          <style>{`
            .nouveautes-slider .slick-track { align-items: stretch; }
            .nouveautes-slider .slick-slide > div { height: 100%; }
          `}</style>

          <Slider key={sliderKey} className="nouveautes-slider" {...settings}>
            {filtered!.map((p) => (
              <div key={p.id} className="px-1 md:px-3 py-3">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.8 }}
                  className="
                    h-[520px] sm:h-[540px] md:h-[560px]
                    bg-white shadow-md rounded-2xl p-4
                    flex flex-col justify-between
                    hover:shadow-lg transition-shadow
                  "
                >
                  {/* --- Bloc haut : image + marque + titre/specs --- */}
                  <div className="space-y-2">
                    {/* Image (un peu plus grande pour mieux remplir) */}
                    <div className="w-full rounded-2xl overflow-hidden">
                      <div className="h-[190px] sm:h-[220px] md:h-[250px]">
                        <img
                          src={p.image || FALLBACK_SVG}
                          alt={p.name}
                          className="w-full h-full object-contain object-center block"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
                          }}
                        />
                      </div>
                    </div>

                    {/* Marque */}
                    <h4 className="text-xs sm:text-sm text-gray-500 text-center">
                      {p.brand?.nom || ""}
                    </h4>

                    {/* Titre + specs (clamp) */}
                    <div className="px-1">
                      <p
                        className="font-semibold text-gray-800 text-sm sm:text-base text-center
                                   overflow-hidden [display:-webkit-box] [WebkitBoxOrient:vertical] [WebkitLineClamp:2]"
                        title={p.name}
                      >
                        {p.name}
                      </p>
                      {p.specs && (
                        <p
                          className="mt-1 text-xs sm:text-sm text-gray-600 text-center
                                     overflow-hidden [display:-webkit-box] [WebkitBoxOrient:vertical] [WebkitLineClamp:3]"
                          title={p.specs}
                        >
                          {p.specs}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* --- Prix (section centrale) --- */}
                  <div className="mt-2 flex items-center justify-center">
                    {p.price ? (
                      <span className="font-bold text-gray-900 text-sm sm:text-base">
                        Fcfa {p.price}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs sm:text-sm">Prix indisponible</span>
                    )}
                  </div>

                  {/* --- État (collé en bas) --- */}
                  {p.state && (
                    <div className="mt-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium w-full text-center">
                      État&nbsp;: {p.state}
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Bouton Voir plus */}
      <motion.button
        onClick={() => navigate("/Produits")}
        className="bg-[#00A9DC] text-white px-6 py-2 md:py-3 rounded-2xl font-semibold hover:bg-sky-600 transition-colors mt-5"
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
