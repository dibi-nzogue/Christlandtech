// src/components/ServicesBloc.tsx
import React from "react";

// Remplace ces imports par tes vraies images si besoin
import imgMaintenance from "../assets/images/achat/Reliable Electronic Components Distributor.webp";
import imgComms from "../assets/images/achat/Internet.webp";
import imgThird from "../assets/images/achat/SOCIAL MEDIA MANAGERS.webp";

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
  // 3e bloc : IMAGE en haut + TEXTE seul dessous
  {
    accroche:
      "Nous travaillons dur pour connaître nos clients, comprendre leurs besoins et les mettre au cœur de tout ce que nous faisons. Nous travaillons sans relâche pour bâtir leur confiance à long terme afin qu'ils puissent compter sur nous dans un monde complexe et en constante évolution, et cela est toujours soutenu par la valeur inégalée que nous créons pour eux grâce à notre portefeuille de services équilibré.",
    image: imgThird,
  },
];

const ServicesBloc: React.FC = () => {
  return (
    <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
      {/* space-y = espace uniquement, aucune ligne */}
      <div className="space-y-8 lg:space-y-10">
        {ITEMS.map((it, idx) => {
          const onlyImageAndText = !it.title && !(it.points && it.points.length);

          if (onlyImageAndText) {
            // ===== 3e BLOC : image AU-DESSUS + paragraphe dessous (aucune bordure) =====
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
                  <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-700">
                    {it.accroche}
                  </p>
                </div>
              </div>
            );
          }

          // ===== BLOC STANDARD : image à gauche, texte à droite (aucune bordure) =====
          return (
            <article
              key={idx}
              className="rounded-2xl bg-white p-3 sm:p-4 lg:p-5 shadow-none"
            >
              <div className="grid items-stretch gap-4 sm:gap-5 lg:gap-6 md:grid-cols-[260px,1fr]">
                {/* Image */}
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={it.image}
                    alt={it.title ?? "illustration"}
                    className="w-full h-[200px] sm:h-[240px] md:h-[300px] lg:h-[340px] object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Texte */}
                <div className="pt-1 max-w-[760px] leading-[1.65]">
                  {it.title && (
                    <h3 className="text-[15px] sm:text-[16px] font-semibold text-gray-900 mb-2 ">
                      {it.title}
                    </h3>
                  )}

                  <p className="text-[13px] sm:text-[14px] text-gray-700 mb-3 py-3">
                    {it.accroche}
                  </p>

                  {it.points?.length ? (
                    <>
                      <p className="text-[13px] sm:text-[14px] font-medium text-gray-800 mb-1">
                        {it.points[0]}
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-[13px] sm:text-[14px] text-gray-700 marker:text-[#00A8E8]">
                        {it.points.slice(1).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesBloc;
