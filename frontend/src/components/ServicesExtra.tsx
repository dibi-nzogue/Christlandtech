// src/components/ServicesExtra.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// images (remplace par les tiennes)
import imgSecurite from "../assets/images/achat/69249ff2-e5f5-438f-9427-d61c3295ca52.webp";
import imgReseau from "../assets/images/achat/Réseau informatique_.webp";
import imgMerci from "../assets/images/achat/Profession.webp";

type ExtraItem = {
  title: string;
  accroche: string;
  points: string[]; // [titreSection, ...puces]
  image: string;
};

const ITEMS: ExtraItem[] = [
  {
    title: "Sécurité",
    accroche:
      "Accroche : Protégez vos postes, vos données et votre réseau contre les menaces.",
    points: [
      "Ce que ça comprend :",
      "Protection des postes/serveurs : Kaspersky Endpoint, EDR, chiffrement (BitLocker), correctifs automatisés.",
      "Sécurité Microsoft : Defender for Business, MFA, Intune/MDM, stratégies d’accès conditionnel.",
      "Protection des postes/serveurs : Kaspersky Endpoint, EDR, chiffrement (BitLocker), correctifs automatisés.",
      "Sécurité Microsoft : Defender for Business, MFA, Intune/MDM, stratégies d’accès conditionnel.",
      
    ],
    image: imgSecurite,
  },
  {
    title: "Réseau informatique",
    accroche:
      "Accroche : Un réseau fiable, rapide et sécurisé pour vos bureaux et sites distants.",
    points: [
      "Ce que ça comprend :",
      "Câblage & baies : cuivre Cat6/6A, fibre optique, brassage, certification (tests Fluke).",
      "Switching & Routage : VLAN, QoS, LACP, Spanning-Tree, interconnexion de sites (VPN).",
      "Wi-Fi Pro : site survey, contrôleur centralisé, portail captif, roaming fluide, PoE.",
    ],
    image: imgReseau,
  },
];

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex gap-2 md:gap-2.5 lg:gap-3 leading-[1.55] md:leading-7 lg:leading-8">
    <span className="mt-[7px] h-2 w-2 rounded-full bg-[#00A8E8]" />
    <span className="text-[13px] sm:text-[14px] lg:text-[15px]">{children}</span>
  </li>
);

/* ---------- Sous-composant : une ligne avec clamp & Voir plus ---------- */
const ExtraRow: React.FC<{
  item: ExtraItem;
  reverseOnMd?: boolean; // pour le 2e bloc
}> = ({ item, reverseOnMd }) => {
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

  return (
    <article className="grid grid-cols-12 items-stretch gap-3 md:gap-5 lg:gap-6">
      {/* Colonne TEXTE (toujours 1ère dans le DOM pour mobile) */}
      <div
        className={`col-span-12 md:col-span-7 ${
          reverseOnMd ? "md:order-2" : "md:order-1"
        }`}
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

              <p className="text-[13px] sm:text-[14px] font-medium text-gray-800 mb-1">
                {item.points[0]}
              </p>
              <ul className="space-y-1.5 md:space-y-2 lg:space-y-3 text-[13px] sm:text-[14px] text-gray-700">
                {item.points.slice(1).map((p, i) => (
                  <Bullet key={i}>{p}</Bullet>
                ))}
              </ul>
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
            {open ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>

      {/* Colonne IMAGE */}
      <div
        className={`col-span-12 md:col-span-5 ${
          reverseOnMd ? "md:order-1" : "md:order-2"
        }`}
      >
        <div ref={imgBoxRef} className="rounded-2xl overflow-hidden w-full h-full">
         <img
  src={item.image}
  alt={item.title}
  className="
    w-full object-cover
    aspect-[16/10] sm:aspect-[4/3]
    md:aspect-auto md:h-full
  "
  loading="lazy"
  decoding="async"
  sizes="(min-width: 1024px) 560px, (min-width: 768px) 45vw, 100vw"
  onLoad={measure}
/>

        </div>
      </div>
    </article>
  );
};

const ServicesExtra: React.FC = () => {
  return (
    <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
      <div className="space-y-10 lg:space-y-12">
        {/* Bloc 1 : TEXTE | IMAGE (md+) */}
        <ExtraRow item={ITEMS[0]} />

        {/* Bloc 2 : IMAGE | TEXTE (md+) */}
        <ExtraRow item={ITEMS[1]} reverseOnMd />

        {/* Grande image + MERCI */}
        <div
          className="
            rounded-2xl w-full overflow-hidden
            h-[220px] sm:h-[300px] md:h-[380px] lg:h-[440px]
            bg-no-repeat bg-cover
          "
          style={{
            backgroundImage: `url(${imgMerci})`,
            backgroundPosition: "center 68%",
          }}
          aria-label="Merci"
        />

        <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-7">
          <h4 className="text-center text-[15px] sm:text-[16px] font-semibold text-gray-900 mb-2">
            MERCI
          </h4>
          <p className="mx-auto lg:max-w-6xl md:max-w-4xl text-center text-[11px] sm:text-[12px] leading-relaxed text-gray-700">
            Chez CHRISTLANDTECH, nous croyons qu’un service impeccable commence par un accueil chaleureux et se
            termine par un client serein. De la première information jusqu’au suivi après-vente, nous nous engageons
            à vous apporter expertise, clarté et professionnalisme. Avec une qualité de service accessible, nous
            mettons en place des promotions toute l’année : offres du mois, remises week-end, packs, cartes de
            fidélité. Vous repartez rassuré, bien conseillé… et avec le meilleur rapport qualité-prix.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ServicesExtra;
