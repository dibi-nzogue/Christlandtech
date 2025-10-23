// src/components/ServiceIntro.tsx
import React from "react";
import banner from "../assets/images/achat/07b83e0c-2d5b.webp";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion"; // ← ajoute Variants

const ServiceIntro: React.FC = () => {
  const { t } = useTranslation();

  // ✅ on type les variants + ease en cubic-bezier
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const containerStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };


// ... tes variants existants
const fadeUpIndexed: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.12, // ← échelonnage
    },
  }),
};

  return (
    <section className="bg-white">
      <div className="sm:mx-[2%] md:mx-[1%] lg:mx-[3%] mx-[3%]">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} // ✅ bezier
          className="relative border border-gray-200 overflow-hidden
                     aspect-[29/9] sm:aspect-[29/9] md:aspect-[29/9] lg:aspect-[32/9]"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <motion.div
            initial={{ backgroundColor: "rgba(0,0,0,0.0)" }}
            animate={{ backgroundColor: "rgba(0,0,0,0.30)" }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          />

          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="show"
            className="absolute inset-0 flex items-center justify-center text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="text-white uppercase font-extrabold tracking-wide
                         text-xl sm:text-3xl md:text-5xl lg:text-6xl drop-shadow-md"
            >
              {t("ser.title")}{" "}
              <motion.span
                variants={fadeUp}
                transition={{ delay: 0.08 }}
                className="text-[#00A8E8]"
              >
                {t("ser.title1")}
              </motion.span>
            </motion.h1>
          </motion.div>
        </motion.div>
      </div>

      {/* ===== INTRO TEXTE ===== */}
<div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 py-10 text-left">
  {/* conteneur qui déclenche l’apparition */}
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
  >
    {/* 1) le bas (paragraphe) sort en premier */}
    <motion.p
      variants={fadeUpIndexed}
      custom={0}
      className="text-[12px] sm:text-[14px] md:text-[18px] lg:text-[22px] text-[#00A8E8] mb-6"
    >
      {t("ser.an")}
    </motion.p>

    {/* 2) la petite barre sort ensuite */}
    <motion.div
      variants={fadeUpIndexed}
      custom={1}
      className="h-[3px] w-12 bg-[#00A8E8] mt-1 mb-6 rounded"
    />

    {/* 3) le titre (en haut) sort en dernier */}
    <motion.h3
      variants={fadeUpIndexed}
      custom={2}
      className="text-[15px] sm:text-[16px] md:text-[20px] lg:text-[28px]
                 font-semibold text-gray-900 uppercase leading-snug"
    >
      {t("ser.ch")}
      <br />
      {t("ser.ch1")}
    </motion.h3>
  </motion.div>
</div>

    </section>
  );
};

export default ServiceIntro;
