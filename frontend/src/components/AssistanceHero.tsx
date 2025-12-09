// src/components/AssistanceHero.tsx 
import React from "react";
import imgMerci from "../assets/images/achat/𝕮𝖔𝖒𝖕𝖚𝖙𝖊𝖗𝕸𝖔𝖈𝖐.webp";
import { useBlogHero } from "../hooks/useFetchQuery";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants, Transition } from "framer-motion";

type Props = {
  titleLeft?: string;   // "ARTICLE"
  titleRight?: string;  // "BLOG"
};

const CONTAINER = "mx-auto max-w-screen-2xl px-6 sm:px-8 lg:px-10";

/* ----------------- Transitions & Variants ----------------- */

// tween lent, fluide
const TWEEN_SLOW: Transition = {
  type: "tween",
  duration: 1.15,
  ease: [0.22, 1, 0.36, 1],
};

// image reveal (fade + léger zoom-out)
const EASE_IMG: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };

// fade global de la section
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

/* ------ HERO: ARTICLE puis BLOG (du haut vers le bas) ------ */

const titleOrchestrator: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.85,
      delayChildren: 0.25,
    },
  },
};

const slideFromTopSlow: Variants = {
  hidden: { y: -80, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: TWEEN_SLOW,
  },
};

/* ------ Texte (slug) : du bas vers le haut à l’entrée ------ */

const riseFromBottomOnView: Variants = {
  hidden: { y: 28, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* -------------------------------- Helpers -------------------------------- */
function splitTitle(title?: string | null) {
  const t = (title || "").trim();
  if (!t) return { first: "BIENVENUE", rest: "DANS NOTRE UNIVERS" };
  const [first, ...restArr] = t.split(/\s+/);
  return { first: first || "", rest: restArr.join(" ") || "" };
}

/* ------------------------------- Component ------------------------------- */
const AssistanceHero: React.FC<Props> = ({
  titleLeft = "ARTICLE",
  titleRight = "BLOG",
}) => {
  const { data: hero, loading } = useBlogHero(); // { title, slug }
  const { first, rest } = React.useMemo(() => splitTitle(hero?.title), [hero?.title]);

  return (
    <motion.section
      className="w-full relative"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      {/* HERO plein écran */}
      <div className="relative w-full h-[240px] md:h-[360px] lg:h-[780px]">
        <motion.img
        loading="lazy"
          src={imgMerci}
          width={300}
                      height={300}
          alt="Bannière Assistance"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={EASE_IMG}
        />

        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Titre HERO: ARTICLE (haut→bas) puis BLOG (haut→bas). "/" en fade, sans mouvement. */}
        <div className="relative h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`${titleLeft}-${titleRight}`}
              className="sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-wide overflow-hidden transform-gpu will-change-transform"
              variants={titleOrchestrator}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              {/* 1) ARTICLE — arrive du haut vers le bas */}
              <motion.span variants={slideFromTopSlow} className="inline-block text-white">
                {titleLeft}
              </motion.span>

              {/* "/" — juste un fade */}
              <motion.span
                className="inline-block mx-2 text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                /
              </motion.span>

              {/* 2) BLOG — arrive du haut vers le bas */}
              <motion.span variants={slideFromTopSlow} className="inline-block text-[#00A8E8]">
                {titleRight}
              </motion.span>
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* CONTENU */}
      <div className={`relative z-10 ${CONTAINER} py-10`}>
        <div className="py-6 md:py-10">
          {/* H2 — le titre ENTIER glisse de la GAUCHE → vers sa place (immédiat) */}
          <motion.h2
            className="text-center font-semibold tracking-wide lg:text-[20px] md:text-[18px] sm:text-[15px] text-[12px]"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={TWEEN_SLOW}
          >
            {/* on montre toujours quelque chose grâce au fallback de splitTitle */}
            <span className="text-[#00A8E8]">{first}</span>{" "}
            <span className="text-gray-900">{rest}</span>
          </motion.h2>

          {/* Texte (slug) — du bas vers le haut (au scroll) */}
          <motion.div
            className="mt-5 lg:text-[18px] md:text-[16px] sm:text-[14px] text-[12px] text-gray-700"
            variants={riseFromBottomOnView}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: 0.08 }}
          >
            {loading && !hero?.slug ? (
              <p className="mb-3 opacity-70">Chargement…</p>
            ) : (
              <p className="mb-3 break-words">{hero?.slug || ""}</p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AssistanceHero;
