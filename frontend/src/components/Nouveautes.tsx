import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Tag, ShieldCheck, PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

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
    const handleProductCreated = () => refetch();
    window.addEventListener("product:created", handleProductCreated);
    return () => window.removeEventListener("product:created", handleProductCreated);
  }, [refetch]);

  /* Onglets */
  const [activeTab, setActiveTab] = useState<string>(ALL_KEY);
  const tabs = useMemo(() => {
    if (!latest?.length) return [ALL_KEY];
    const unique = Array.from(
      new Set(latest.map((p: any) => p.category?.nom).filter((c: any): c is string => !!c))
    );
    return [ALL_KEY, ...unique];
  }, [latest]);

  /* Filtrage */
  const filtered = useMemo(() => {
    if (!latest) return [];
    if (activeTab === ALL_KEY) return latest;
    return latest.filter(
      (p: any) => p.category?.nom === activeTab || p.categorie?.nom === activeTab
    );
  }, [latest, activeTab]);

  const visibleSlides = useVisibleSlides();
  const count = filtered?.length ?? 0;

  const isMobile = visibleSlides === 1;
  const slidesToShow = isMobile ? 1 : visibleSlides;

  const showArrows = slidesToShow >= 2 && count > slidesToShow;
  const autoPlayMobile = isMobile && !!activeTab && count > 1;

  // === Keen Slider ===
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
            let paused = false;

            const clearNextTimeout = () => clearTimeout(timeout);

            const nextTimeout = () => {
              clearTimeout(timeout);
              if (paused) return;
              timeout = setTimeout(() => slider.next(), 2500);
            };

            const pause = () => {
              paused = true;
              clearNextTimeout();
            };

            const resume = () => {
              paused = false;
              nextTimeout();
            };

            const onVisibility = () => {
              if (document.hidden) pause();
              else resume();
            };

            slider.on("created", () => {
              slider.container.addEventListener("pointerdown", pause);
              slider.container.addEventListener("pointerup", resume);
              slider.container.addEventListener("touchstart", pause, { passive: true });
              slider.container.addEventListener("touchend", resume);
              document.addEventListener("visibilitychange", onVisibility);
              nextTimeout();
            });

            slider.on("destroyed", () => {
              document.removeEventListener("visibilitychange", onVisibility);
            });

            slider.on("dragStarted", pause);
            slider.on("animationEnded", resume);
            slider.on("updated", resume);
          },
        ]
      : []
  );

  useEffect(() => {
    sliderInstanceRef.current?.update();
  }, [activeTab, slidesToShow, count, sliderInstanceRef]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  // Badge état
  const StateBadge = ({ state }: { state?: string }) => {
    if (!state) return null;
    const s = String(state).toLowerCase();

    let Icon = PackageCheck;
    if (s.includes("neuf") || s.includes("new")) Icon = Sparkles;
    if (s.includes("garantie") || s.includes("warranty")) Icon = ShieldCheck;
    if (s.includes("promo") || s.includes("discount")) Icon = Tag;

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm">
        <Icon size={14} />
        {state}
      </span>
    );
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

    const categoryLabel = p.category?.nom || p.categorie?.nom || "";
    const brandLabel = p.marque?.nom || "";

    return (
      <motion.article
        key={p.id}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="
          group relative h-[520px] sm:h-[540px] md:h-[560px]
          rounded-3xl border border-gray-200/70
          bg-white/80 backdrop-blur
          shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          hover:shadow-[0_18px_55px_rgba(0,0,0,0.12)]
          overflow-hidden
        "
      >
        {/* halo */}
        <div
          className="
            pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            bg-[radial-gradient(circle_at_50%_20%,rgba(0,169,220,0.20),transparent_60%)]
          "
        />

        {/* shine */}
        <div
          className="
            pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
            transition-[opacity,transform]
            bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.45)_40%,transparent_70%)]
            translate-x-[-35%] group-hover:translate-x-[35%]
          "
          style={{
            transitionDuration: "250ms, 700ms",
            transitionTimingFunction: "ease, ease",
          }}
        />

        <div className="p-4 sm:p-5 flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600 truncate max-w-[60%]">
              {categoryLabel}
            </span>
            <StateBadge state={p.state} />
          </div>

          <div className="mt-3 rounded-2xl border border-gray-200/70 bg-white overflow-hidden">
            <div className="relative h-[190px] sm:h-[220px] md:h-[250px]">
              <img
                src={p.image || FALLBACK_SVG}
                alt={p.nom}
                width={600}
                height={600}
                className="
                  w-full h-full object-contain object-center block
                  transition-transform duration-500
                  group-hover:scale-[1.06]
                "
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src !== FALLBACK_SVG) img.src = FALLBACK_SVG;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </div>

          <h4 className="mt-3 text-xs sm:text-sm text-gray-500 text-center">
            {brandLabel}
          </h4>

          <div className="mt-1 px-1 flex-1">
            <p
              className="
                font-extrabold text-gray-900 text-sm sm:text-base text-center
                overflow-hidden [display:-webkit-box] [WebkitBoxOrient:vertical] [WebkitLineClamp:2]
                group-hover:text-[#00A9DC] transition-colors
              "
              title={p.nom}
            >
              {p.nom}
            </p>

            {p.specs && (
              <p
                className="
                  mt-2 text-xs sm:text-sm text-gray-600 text-center
                  overflow-hidden [display:-webkit-box] [WebkitBoxOrient:vertical] [WebkitLineClamp:3]
                "
                title={p.specs}
              >
                {p.specs}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-center">
            {priceDisplay ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#00A9DC] text-white px-4 py-2 text-sm sm:text-base font-extrabold">
                Fcfa {priceDisplay}
              </span>
            ) : (
              <span className="text-gray-400 text-xs sm:text-sm">
                Prix indisponible
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center">
            <span className="text-[11px] text-gray-500 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300">
              Survolez pour zoom ✨
            </span>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    // ✅ font-sans : police uniforme
    // ✅ hide-scrollbar : enlève la scrollbar verticale visible
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 flex flex-col items-center py-10 bg-white overflow-visible">
      <motion.h2
        className="text-2xl sm:text-3xl font-extrabold mb-6 text-gray-900 text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {t("new")}
      </motion.h2>

      <motion.div
        className="flex flex-wrap gap-2 md:gap-3 mb-6 justify-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "px-4 py-2 rounded-full text-sm md:text-base font-semibold transition font-sans",
                "border",
                active
                  ? "bg-[#00A9DC] text-white border-[#00A9DC] shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              {tab === ALL_KEY ? t("see.all") : tab}
            </button>
          );
        })}
      </motion.div>

      {error && !loading && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && count > 0 && (
        count <= visibleSlides ? (
          <div className="w-full mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p: any) => (
                <div key={p.id} className="px-1 md:px-3 py-3">
                  {renderCard(p)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full mb-10">
            {showArrows && (
              <>
                <button
                  type="button"
                  onClick={() => sliderInstanceRef.current?.prev()}
                  aria-label="Previous"
                  className="
                    flex absolute top-1/2 -translate-y-1/2 left-2 sm:-left-4 z-10
                    rounded-full p-2.5 sm:p-3
                    bg-white/90 backdrop-blur border border-gray-200
                    shadow-md hover:shadow-lg hover:bg-white transition
                    rotate-180
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9DC]/60
                  "
                >
                  <ArrowRight size={18} className="text-gray-800" />
                </button>

                <button
                  type="button"
                  onClick={() => sliderInstanceRef.current?.next()}
                  aria-label="Next"
                  className="
                    flex absolute top-1/2 -translate-y-1/2 right-2 sm:-right-4 z-10
                    rounded-full p-2.5 sm:p-3
                    bg-white/90 backdrop-blur border border-gray-200
                    shadow-md hover:shadow-lg hover:bg-white transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9DC]/60
                  "
                >
                  <ArrowRight size={18} className="text-[#00A9DC]" />
                </button>
              </>
            )}

            {/* ✅ hide-scrollbar ici aussi pour être sûr */}
            <div className="overflow-x-hidden overflow-y-hidden">
              <div
                ref={sliderRef}
               className={`keen-slider overflow-x-hidden overflow-y-hidden py-6 -my-6 ${isMobile ? "max-w-[520px] mx-auto" : ""}`}
              >
                {filtered.map((p: any) => (
                  <div
                    key={p.id}
                    className={`keen-slider__slide ${
                      isMobile ? "px-0 py-3" : "px-1 md:px-3 py-3"
                    }`}
                  >
                    {renderCard(p)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      <motion.button
        onClick={() => navigate("/Produits")}
        className="
          mt-5 inline-flex items-center justify-center gap-2
          rounded-2xl px-6 py-2.5 md:py-3
          bg-[#00A9DC] text-white font-extrabold
          hover:bg-sky-600 transition
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9DC]/60
          font-sans
        "
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {t("pdt")}
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}