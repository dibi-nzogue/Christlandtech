// src/components/ServicesExtra.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";

// images (remplace par les tiennes)
import imgSecurite from "../assets/images/achat/69249ff2-e5f5-438f-9427-d61c3295ca52.webp";
import imgReseau from "../assets/images/achat/Réseau informatique_.webp";
import imgMerci from "../assets/images/achat/Profession.webp";

type ExtraItem = {
  title: string;
  accroche: string;
  points: string[]; // [sectionTitle, ...bullets]
  image: string;
};

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex gap-2 md:gap-2.5 lg:gap-3 leading-[1.55] md:leading-7 lg:leading-8">
    <span className="mt-[7px] h-2 w-2 rounded-full bg-[#00A8E8]" />
    <span className="text-[13px] sm:text-[14px] lg:text-[15px]">{children}</span>
  </li>
);

// helper i18n → array
const toArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

/* ===================== Variants Framer Motion ===================== */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Croisé (texte/image opposés)
const fromSide = (dir: "left" | "right"): Variants => ({
  hidden: { opacity: 0, x: dir === "left" ? -36 : 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
});

// Dernière section : image du bas, texte de la droite
const fromBottom: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const fromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ---------- Sous-composant : une ligne avec clamp & Voir plus + ANIM + HOVER ZOOM ---------- */
const ExtraRow: React.FC<{
  item: ExtraItem;
  reverseOnMd?: boolean; // inverse la grille + les sens d'apparition
}> = ({ item, reverseOnMd }) => {
  const { t } = useTranslation();
  const imgBoxRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const textInnerRef = useRef<HTMLDivElement>(null);

  const [imgHeight, setImgHeight] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [open, setOpen] = useState(false);

  const measure = () => {
    const ih = imgBoxRef.current?.getBoundingClientRect().height ?? 0;
    const th = textInnerRef.current?.scrollHeight ?? 0;
    setImgHeight(ih);
    setOverflowing(th > ih + 2);
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

  // Sens croisé : si reverseOnMd = true → texte arrive de la droite, image de la gauche
  const textVariants = fromSide(reverseOnMd ? "right" : "left");
  const imageVariants = fromSide(reverseOnMd ? "left" : "right");

  return (
    <motion.article
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="grid grid-cols-12 items-start gap-3 md:gap-5 lg:gap-6"
    >
      {/* Colonne TEXTE (toujours 1ère dans le DOM pour mobile) */}
      <motion.div
        variants={textVariants}
        className={`col-span-12 md:col-span-7 ${reverseOnMd ? "md:order-2" : "md:order-1"}`}
      >
        <h3 className="text-[17px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-gray-900 mb-2">
          {item.title}
        </h3>

        <div className="relative">
          {/* zone clampée */}
          <div
            ref={textWrapRef}
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          >
            <div ref={textInnerRef} className="pr-0">
              <p className="text-[13px] sm:text-[14px] text-gray-700 mb-3">
                {item.accroche}
              </p>

              {item.points.length > 0 && (
                <>
                  <p className="text-[13px] sm:text-[14px] font-medium text-gray-800 mb-1">
                    {item.points[0]}
                  </p>
                  {/* Stagger des puces */}
                  <motion.ul
                    variants={listStagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    className="space-y-1.5 md:space-y-2 lg:space-y-3 text-[13px] sm:text-[14px] text-gray-700"
                  >
                    {item.points.slice(1).map((p, i) => (
                      <motion.li key={i} variants={itemUp}>
                        <Bullet>{p}</Bullet>
                      </motion.li>
                    ))}
                  </motion.ul>
                </>
              )}
            </div>
          </div>

          {/* dégradé quand fermé & overflow */}
          {!open && overflowing && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent rounded-b-xl" />
          )}
        </div>

        {overflowing && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-3 inline-flex items-center rounded-full bg-[#00A8E8] px-3 py-1 text-[12px] font-medium text-white hover:opacity-90"
          >
            {open ? t("see.less") : t("see.more")}
          </button>
        )}
      </motion.div>

      {/* Colonne IMAGE (avec zoom hover) */}
      <motion.div
        variants={imageVariants}
        className={`col-span-12 md:col-span-5 ${reverseOnMd ? "md:order-1" : "md:order-2"}`}
      >
        <div
          ref={imgBoxRef}
          className="rounded-2xl overflow-hidden w-full self-start h-auto md:h-[220px] lg:h-[270px] xl:h-[300px]"
        >
          <motion.img
            src={item.image}
            alt={item.title}
            className="w-full object-cover
                       aspect-[16/10] sm:aspect-[4/3]
                       md:aspect-auto md:h-full transform-gpu will-change-transform"
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 560px, (min-width: 768px) 45vw, 100vw"
            onLoad={measure}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          />
        </div>
      </motion.div>
    </motion.article>
  );
};

const ServicesExtra: React.FC = () => {
  const { t } = useTranslation();

  const items: ExtraItem[] = [
    {
      title: t("ex1.tit"),
      accroche: t("ex1.ac"),
      points: toArray(t("ex1.points", { returnObjects: true })),
      image: imgSecurite,
    },
    {
      title: t("ex2.tit"),
      accroche: t("ex2.ac"),
      points: toArray(t("ex2.points", { returnObjects: true })),
      image: imgReseau,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
      <div className="space-y-10 lg:space-y-12">
        {/* Bloc 1 : TEXTE (gauche) | IMAGE (droite) */}
        <ExtraRow item={items[0]} />

        {/* Bloc 2 : IMAGE (gauche) | TEXTE (droite) -> reverseOnMd */}
        <ExtraRow item={items[1]} reverseOnMd />

        {/* ===== Dernière section (image du bas vers le haut, texte de droite vers gauche) ===== */}
        <motion.div
          variants={fromBottom}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          // zoom léger au survol de la grande image
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="
            rounded-2xl w-full overflow-hidden
            h-[220px] sm:h-[300px] md:h-[380px] lg:h-[440px]
            bg-no-repeat bg-cover transform-gpu will-change-transform
          "
          style={{
            backgroundImage: `url(${imgMerci})`,
            backgroundPosition: "center 68%",
          }}
          aria-label="Merci"
        />

        <motion.div
          variants={fromRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="rounded-2xl bg-white p-4 sm:p-6 lg:p-7"
        >
          <h4 className="text-center text-[15px] sm:text-[16px] font-semibold text-gray-900 mb-2">
            {t("ser.me")}
          </h4>
          <p className="mx-auto lg:max-w-6xl md:max-w-4xl text-center text-[11px] sm:text-[12px] leading-relaxed text-gray-700">
            {t("ser.me1")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesExtra;
