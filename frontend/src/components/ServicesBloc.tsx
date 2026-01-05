
import React, { useEffect, useLayoutEffect, useRef, useState, useId } from "react";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";

import imgMaintenance from "../assets/images/achat/6614c6fd-129e-450f-9b14-765118c05dc5.webp";
import imgComms from "../assets/images/achat/Internet.webp";
import imgThird from "../assets/images/achat/40ed6cec-b56c-42eb-a629-85143d1023b5.webp";

type ServiceItem = {
  image: string;
  accroche: string;
  title?: string;
  points?: string[];
};

const toArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

/* ------------ Variants Framer Motion (réutilisables) ------------ */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const containerStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ---------- Sous-composant : une ligne image | texte avec “Voir plus” ---------- */
const ServiceRow: React.FC<{ item: ServiceItem }> = ({ item }) => {
  const imgBoxRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const textInnerRef = useRef<HTMLDivElement>(null);

  const [imgHeight, setImgHeight] = useState<number>(0);
  const [overflowing, setOverflowing] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const titleId = useId();
  const contentId = useId();

  const measure = () => {
    const ih = imgBoxRef.current?.getBoundingClientRect().height ?? 0;
    const fullTextH = textInnerRef.current?.scrollHeight ?? 0;
    setImgHeight(ih);
    setOverflowing(fullTextH > ih + 2);
    if (!open && textWrapRef.current) {
      textWrapRef.current.style.maxHeight = ih ? `${ih}px` : "none";
    }
  };

  useLayoutEffect(() => {
    measure();
    const onR = () => measure();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!textWrapRef.current) return;
    textWrapRef.current.style.maxHeight = open ? "none" : imgHeight ? `${imgHeight}px` : "none";
  }, [open, imgHeight]);

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="bg-white p-3 sm:p-4 lg:p-5 shadow-none"
      role="article"
      aria-labelledby={item.title ? titleId : undefined}
    >
      <motion.div
        variants={containerStagger}
        className="grid items-stretch gap-4 sm:gap-5 lg:gap-6 md:grid-cols-[260px,1fr]"
      >
        {/* Image avec zoom au survol */}
        <motion.div variants={itemUp} className="h-full">
          <div
            ref={imgBoxRef}
            className="group h-full rounded-2xl overflow-hidden"
          >
            <motion.img
              src={item.image}
              width={300}
              height={300}
              alt={item.title ?? "Illustration d’un service Christland Tech"}
              className="h-full w-full object-cover sm:h-[240px] md:h-[300px] lg:h-[340px] transform-gpu will-change-transform"
              loading="lazy"
              onLoad={measure}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
            />
          </div>
        </motion.div>

        {/* Texte */}
        <motion.div
          variants={itemUp}
          className="pt-1 max-w-[760px] leading-[1.65] relative"
        >
          {item.title && (
            <motion.h3
              id={titleId}
              variants={itemUp}
              className="text-[17px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-gray-900 mb-2"
            >
              {item.title}
            </motion.h3>
          )}

          <div className="relative">
            <div
              ref={textWrapRef}
              id={contentId}
              role="region"
              aria-label={item.title ?? "Détails du service"}
              className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            >
              <div ref={textInnerRef}>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-gray-700 mb-3">
                  {item.accroche}
                </p>

                {item.points?.length ? (
                  <>
                    <p className="text-[15px] sm:text-[16px] md:text-[16px] lg:text-[17px] font-medium text-gray-800 mb-2">
                      {item.points[0]}
                    </p>
                    {/* Stagger des puces */}
                    <motion.ul
                      variants={containerStagger}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.3 }}
                      className="list-disc pl-5 text-[13px] sm:text-[15px] md:text-[14px] lg:text-[15px] text-gray-700 marker:text-[#00A8E8]
                                 space-y-1.5 md:space-y-2 lg:space-y-3"
                    >
                      {item.points.slice(1).map((p, i) => (
                        <motion.li key={i} variants={itemUp}>
                          {p}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </>
                ) : null}
              </div>
            </div>

            {!open && overflowing && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent rounded-b-xl" />
            )}
          </div>

          {overflowing && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-3 inline-flex items-center rounded-full bg-[#00A8E8] px-3 py-1 text-[12px] font-medium text-white hover:opacity-90"
              aria-expanded={open}
              aria-controls={contentId}
            >
              {open ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </motion.div>
      </motion.div>
    </motion.article>
  );
};

const ServicesBloc: React.FC = () => {
  const { t } = useTranslation();

  const items: ServiceItem[] = [
    {
      title: t("ser.tit"),
      accroche: t("ser.ac"),
      points: toArray(t("ser.points1", { returnObjects: true })),
      image: imgMaintenance,
    },
    {
      title: t("ser.tit2"),
      accroche: t("ser.ac2"),
      points: toArray(t("ser.points2", { returnObjects: true })),
      image: imgComms,
    },
    {
      accroche: t("ser.ac3"),
      image: imgThird,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10"
      aria-label="Section des services informatiques Christland Tech"
    >
      <div className="space-y-8 lg:space-y-10">
        {items.map((it, idx) => {
          const onlyImageAndText = !it.title && !(it.points && it.points.length);

          if (onlyImageAndText) {
            // carte image au-dessus + paragraphe (aussi animée au scroll) + zoom hover
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="space-y-4 sm:space-y-5 lg:space-y-6"
              >
                <motion.div variants={itemUp} className="rounded-2xl overflow-hidden">
                  <motion.img
                    src={it.image}
                    width={300}
                    height={300}
                    alt="Illustration d’un service Christland Tech"
                    className="w-full h-[200px] sm:h-[260px] md:h-[340px] lg:h-[400px] object-cover transform-gpu will-change-transform"
                    loading="lazy"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  />
                </motion.div>
                <motion.div
                  variants={itemUp}
                  className="rounded-2xl bg-white p-4 sm:p-6 lg:p-7"
                >
                  <p className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] leading-relaxed text-gray-700">
                    {it.accroche}
                  </p>
                </motion.div>
              </motion.div>
            );
          }

          return <ServiceRow key={idx} item={it} />;
        })}
      </div>
    </motion.section>
  );
};

export default ServicesBloc;
