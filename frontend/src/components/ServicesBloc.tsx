// src/components/ServicesBloc.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import imgMaintenance from "../assets/images/achat/6614c6fd-129e-450f-9b14-765118c05dc5.webp";
import imgComms from "../assets/images/achat/Internet.webp";
import imgThird from "../assets/images/achat/40ed6cec-b56c-42eb-a629-85143d1023b5.webp";

type ServiceItem = {
  image: string;
  accroche: string;
  title?: string;
  points?: string[];
};

const ITEMS: ServiceItem[] = [
  {
    title: "Maintenance informatique",
    accroche:
      "Accroche : Assurez la continuité de votre activité avec une infrastructure propre, mise à jour et suivie.",
    points: [
      "Ce que ça comprend :",
      "Installation : postes Windows/Linux, serveurs, imprimantes, logiciels métiers, antivirus, messagerie (Microsoft 365/Google).",
      "Dépannage : intervention à distance et sur site, diagnostic et résolution, suppression de malwares, recentrage de sécurité.",
      "Conseil : audit de parc, dimensionnement, sauvegardes (NAS/Cloud), plan de continuité (PCA/PRA), migrations (Cloud/On-prem).",
      "Suivi & qualité : tickets via GLPI, rapports d’intervention, SLA (4h / Next Business Day).",
    ],
    image: imgMaintenance,
  },
  {
    title: "Communication",
    accroche:
      "Accroche : Parlez à vos clients au bon moment, sur le bon canal.",
    points: [
      "Ce que ça comprend :",
      "Bulk SMS : expéditeur personnalisé, segmentation, modèles, suivi des livraisons, API pour vos applis.",
      "GLPI (Helpdesk/ITSM) : portail de tickets, catalogue de services, base de connaissances, inventaire automatique, indicateurs SLA.",
      "Contact Center (VoIP) : numéros locaux/DID, IVR, files d’attente, enregistrement d’appels, reporting temps réel, intégration WhatsApp/FB.",
      "Hébergement web & Noms de domaine : enregistrement (.cm, .com…), DNS, SSL, emails pro, mutualisé/VPS, sauvegardes quotidiennes, CDN, uptime 99,9%.",
    ],
    image: imgComms,
  },
  // Carte image pleine largeur + texte dessous
  {
    accroche:
      "Nous travaillons dur pour connaître nos clients, comprendre leurs besoins et les mettre au cœur de tout ce que nous faisons. Nous travaillons sans relâche pour bâtir leur confiance à long terme afin qu'ils puissent compter sur nous dans un monde complexe et en constante évolution, et cela est toujours soutenu par la valeur inégalée que nous créons pour eux grâce à notre portefeuille de services équilibré.",
    image: imgThird,
  },
];

/* ---------- Sous-composant : une ligne image | texte avec “Voir plus” ---------- */
const ServiceRow: React.FC<{ item: ServiceItem }> = ({ item }) => {
  const imgBoxRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const textInnerRef = useRef<HTMLDivElement>(null);

  const [imgHeight, setImgHeight] = useState<number>(0);
  const [overflowing, setOverflowing] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const measure = () => {
    const ih = imgBoxRef.current?.getBoundingClientRect().height ?? 0;
    const fullTextH = textInnerRef.current?.scrollHeight ?? 0;
    setImgHeight(ih);
    setOverflowing(fullTextH > ih + 2); // marge de sécurité
    // si fermé, fixe la hauteur max = hauteur image (sans scrollbar)
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
    if (open) {
      textWrapRef.current.style.maxHeight = "none"; // on déroule tout
    } else {
      textWrapRef.current.style.maxHeight = imgHeight ? `${imgHeight}px` : "none";
    }
  }, [open, imgHeight]);

  return (
    <article className="bg-white p-3 sm:p-4 lg:p-5 shadow-none">
      <div className="grid items-stretch gap-4 sm:gap-5 lg:gap-6 md:grid-cols-[260px,1fr]">
        {/* Image — coins arrondis TOUTES tailles */}
        <div className="h-full">
          <div
            ref={imgBoxRef}
            className="h-full rounded-2xl overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.title ?? "illustration"}
              className="h-full w-full object-cover  sm:h-[240px] md:h-[300px] lg:h-[340px]" // hauteur responsive
              loading="lazy"
              onLoad={measure}
            />
          </div>
        </div>

        {/* Texte — pas de scrollbar; clamp = hauteur image; bouton si overflow */}
        <div className="pt-1 max-w-[760px] leading-[1.65] relative">
          {item.title && (
            <h3 className="text-[17px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
          )}

          <div className="relative">
            {/* zone qui se ferme / s’ouvre sans scrollbar */}
            <div
              ref={textWrapRef}
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
                    <ul className="list-disc pl-5 text-[13px] sm:text-[15px] md:text-[14px] lg:text-[15px] text-gray-700 marker:text-[#00A8E8]
                                   space-y-1.5 md:space-y-2 lg:space-y-3">
                      {item.points.slice(1).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>

            {/* léger dégradé quand c’est fermé et qu’il y a du contenu masqué */}
            {!open && overflowing && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent rounded-b-xl" />
            )}
          </div>

          {/* Bouton seulement s’il y a overflow */}
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
      </div>
    </article>
  );
};

const ServicesBloc: React.FC = () => {
  return (
    <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
      <div className="space-y-8 lg:space-y-10">
        {ITEMS.map((it, idx) => {
          const onlyImageAndText = !it.title && !(it.points && it.points.length);

          if (onlyImageAndText) {
            // carte image au-dessus + paragraphe
            return (
              <div key={idx} className="space-y-4 sm:space-y-5 lg:space-y-6">
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src={it.image}
                    alt="illustration"
                    className="w-full h-[200px] sm:h-[260px] md:h-[340px] lg:h-[400px] object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-7">
                  <p className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] leading-relaxed text-gray-700">
                    {it.accroche}
                  </p>
                </div>
              </div>
            );
          }

          // lignes normales avec “Voir plus”
          return <ServiceRow key={idx} item={it} />;
        })}
      </div>
    </section>
  );
};

export default ServicesBloc;
