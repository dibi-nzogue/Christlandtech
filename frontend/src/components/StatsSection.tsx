import React, { useMemo } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { FaUsers, FaGlobe, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  const stats = useMemo(
    () => [
      { id: 1, icon: FaUsers, number: 100, suffix: "+", label: "stat.client" },
      { id: 2, icon: FaGlobe, number: 5, suffix: " ans", label: "stat.exp" },
      { id: 3, icon: FaShoppingCart, number: 1000, suffix: "+", label: "stat.commande" },
    ],
    []
  );

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });

  const container: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const card: Variants = {
    hidden: { opacity: 0, y: 14, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={ref}
      aria-labelledby="stats-section-title"
      className="
        relative w-full py-10 sm:py-12
        px-4 sm:px-6 lg:px-10
        overflow-hidden
      "
    >
      {/* Background soft gradient */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_30%_20%,rgba(0,169,220,0.12),transparent_55%)]
        "
      />
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_70%_80%,rgba(0,169,220,0.08),transparent_55%)]
        "
      />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Title */}
        <div className="mx-auto mb-6 sm:mb-8 text-center max-w-2xl">
          <motion.h2
            id="stats-section-title"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900"
          >
            {t("stat.title", "Nos chiffres clés")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="mt-2 text-sm sm:text-[15px] text-gray-600"
          >
            {t(
              "stat.subtitle",
              "Une croissance continue, portée par la confiance de nos clients."
            )}
          </motion.p>
        </div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {stats.map((item) => {
            const Icon = item.icon;
            const labelText = t(item.label);
            const srLabel = `${item.number}${item.suffix} ${labelText}`;

            return (
              <motion.div
                key={item.id}
                variants={card}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.995 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                role="group"
                aria-label={srLabel}
                className="
                  group relative rounded-2xl
                  border border-gray-200/70
                  bg-white/70 backdrop-blur
                  shadow-[0_10px_26px_rgba(0,0,0,0.055)]
                  hover:shadow-[0_16px_44px_rgba(0,0,0,0.11)]
                  overflow-hidden
                "
              >
                {/* Glow */}
                <div
                  className="
                    pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    bg-[radial-gradient(circle_at_50%_25%,rgba(0,169,220,0.18),transparent_60%)]
                  "
                />

                {/* Shine */}
                <div
                  className="
                    pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-[opacity,transform]
                    bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.55)_40%,transparent_70%)]
                    translate-x-[-35%] group-hover:translate-x-[35%]
                  "
                  style={{
                    transitionDuration: "220ms, 700ms",
                    transitionTimingFunction: "ease, ease",
                  }}
                />

                <div className="relative p-5 sm:p-6 flex flex-col items-center text-center">
                  {/* Icon bubble */}
                  <div
                    className="
                      relative grid place-items-center
                      h-14 w-14 sm:h-16 sm:w-16
                      rounded-2xl
                      bg-[#E5F7FF]
                      ring-1 ring-[#00A9DC]/20
                    "
                  >
                    <motion.div
                      initial={{ rotate: -6, scale: 0.98 }}
                      whileHover={{ rotate: 0, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="text-[#00A9DC]"
                      aria-hidden="true"
                    >
                      <Icon className="text-[26px] sm:text-[30px]" />
                    </motion.div>

                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#00A9DC]" />
                  </div>

                  {/* Number */}
                  <div className="mt-3">
                    <div
                      className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight"
                      aria-hidden="true"
                    >
                      {inView ? (
                        <CountUp
                          start={0}
                          end={item.number}
                          duration={2}
                          separator=" "
                        />
                      ) : (
                        0
                      )}
                      <span className="text-[#00A9DC]">{item.suffix}</span>
                    </div>

                    <p className="mt-1.5 text-sm sm:text-base font-semibold text-gray-800">
                      {labelText}
                    </p>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-gray-600">
                    {t("stat.hint", "Mise à jour régulière")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;