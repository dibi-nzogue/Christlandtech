// src/components/Nouveautes.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import { useLatestProducts } from "../hooks/useFetchQuery";
import GlobalLoader from "./GlobalLoader";

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





/** Hook: 1 / 2 / 3 colonnes selon la largeur */
function useVisibleSlides() {
  const compute = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 0;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  };
  const [n, setN] = useState<number>(compute);

  useEffect(() => {
    const onResize = () => setN(compute());
    window.addEventListener("resize", onResize);
    const id = setTimeout(onResize, 0);
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

  const { data: latest, loading, error, refetch } = useLatestProducts({
    refreshMs: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    const handleProductCreated = () => {
      refetch();
    };

    window.addEventListener("product:created", handleProductCreated);
    return () => {
      window.removeEventListener("product:created", handleProductCreated);
    };
  }, [refetch]);

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
    return latest.filter(
      (p) => p.category?.nom === activeTab || p.categorie?.nom === activeTab
    );
  }, [latest, activeTab]);

  const visibleSlides = useVisibleSlides();
  const count = filtered?.length ?? 0;

  const slidesToShow = visibleSlides;
  const showArrows = visibleSlides >= 2 && count > slidesToShow;
  const autoPlayMobile = visibleSlides === 1 && count > 1;

  // === Keen Slider (remplace react-slick) ===
  const [sliderRef, sliderInstanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: count > slidesToShow,
      mode: "snap",
      slides: {
        perView: slidesToShow,
        spacing: 16,
      },
    },
    autoPlayMobile
      ? [
          (slider) => {
            let timeout: ReturnType<typeof setTimeout>;
            let mouseOver = false;

            const clearNextTimeout = () => {
              clearTimeout(timeout);
            };

            const nextTimeout = () => {
              clearTimeout(timeout);
              if (mouseOver) return;
              timeout = setTimeout(() => {
                slider.next();
              }, 2500);
            };

            slider.on("created", () => {
              slider.container.addEventListener("mouseover", () => {
                mouseOver = true;
                clearNextTimeout();
              });
              slider.container.addEventListener("mouseout", () => {
                mouseOver = false;
                nextTimeout();
              });
              nextTimeout();
            });

            slider.on("dragStarted", clearNextTimeout);
            slider.on("animationEnded", nextTimeout);
            slider.on("updated", nextTimeout);
          },
        ]
      : []
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  // Carte produit
  const renderCard = (p: any) => {
    const priceDisplay =
      p.price !== null && p.price !== undefined
        ? Number(p.price).toLocaleString("fr-FR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        : null;


        
    return (
      <motion.div
        key={p.id}
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
        <div className="space-y-2">
          <div className="w-full rounded-2xl overflow-hidden">
            <div className="h-[190px] sm:h-[220px] md:h-[250px]">
              <img
                src={p.image || FALLBACK_SVG}
                alt={p.nom}
                width={300}
                 height={300}
                className="w-full h-full object-contain object-center block"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
                }}
              />
            </div>
          </div>

          <h4 className="text-xs sm:text-sm text-gray-500 text-center">
            {p.marque?.nom || ""}
          </h4>

          <div className="px-1">
            <p
              className="font-semibold text-gray-800 text-sm sm:text-base text-center
                       overflow-hidden [display:-webkit-box] [WebkitBoxOrient:vertical] [WebkitLineClamp:2]"
              title={p.nom}
            >
              {p.nom}
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

        <div className="mt-2 flex items-center justify-center">
          {priceDisplay ? (
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              Fcfa {priceDisplay}
            </span>
          ) : (
            <span className="text-gray-400 text-xs sm:text-sm">
              Prix indisponible
            </span>
          )}
        </div>

        {p.state && (
          <div className="mt-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium w-full text-center">
            État&nbsp;: {p.state}
          </div>
        )}
      </motion.div>
    );
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

      {error && !loading && <p className="text-red-600 mb-4">{error}</p>}

      {/* Loader premier chargement */}
      {loading && (!latest || latest.length === 0) && (
        <div className="py-16 flex items-center justify-center w-full">
          <GlobalLoader />
        </div>
      )}

      {/* Carrousel / grille une fois les données là */}
      {!loading && count > 0 && (
        count <= visibleSlides ? (
          <div className="w-full mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered!.map((p) => (
                <div key={p.id} className="px-1 md:px-3 py-3">
                  {renderCard(p)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full mb-10">
            {/* Flèches custom, pilotent Keen Slider */}
            {showArrows && (
              <>
                <button
                  type="button"
                  onClick={() => sliderInstanceRef.current?.prev()}
                  aria-label="Previous"
                  className="flex absolute top-1/2 -translate-y-1/2 left-2 sm:-left-4
                             z-10 bg-white shadow-md rounded-full p-2 sm:p-3 md:p-3
                             cursor-pointer hover:bg-gray-100 transition rotate-180"
                >
                  <ArrowRight size={18} className="text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => sliderInstanceRef.current?.next()}
                  aria-label="Next"
                  className="flex absolute top-1/2 -translate-y-1/2 right-2 sm:-right-4
                             z-10 bg-white shadow-md rounded-full p-2 sm:p-3 md:p-3
                             cursor-pointer hover:bg-gray-100 transition"
                >
                  <ArrowRight size={18} className="text-gray-700" />
                </button>
              </>
            )}

            <div ref={sliderRef} className="keen-slider">
              {filtered!.map((p) => (
                <div
                  key={p.id}
                  className="keen-slider__slide px-1 md:px-3 py-3"
                >
                  {renderCard(p)}
                </div>
              ))}
            </div>
          </div>
        )
      )}

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
