// src/components/AssistanceHero.tsx
import React from "react";
import imgMerci from "../assets/images/achat/𝕮𝖔𝖒𝖕𝖚𝖙𝖊𝖗𝕸𝖔𝖈𝖐.webp";

type Props = {
  titleLeft?: string;
  titleRight?: string;
};

const CONTAINER =
  "mx-auto max-w-screen-2xl px-6 sm:px-8 lg:px-10"; // => DOIT être le même que dans la Navbar

const AssistanceHero: React.FC<Props> = ({
  titleLeft = "ARTICLE",
  titleRight = "BLOG",
}) => {
  return (
    <section className="w-full relative">
      {/* HERO plein écran */}
      <div className="relative w-full h-[240px] md:h-[360px] lg:h-[780px]">
        <img
          src={imgMerci}
          alt="Bannière Assistance"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide">
            <span className="text-white">{titleLeft}</span>
            <span className="mx-2 text-white/60">/</span>
            <span className="text-[#00A8E8]">{titleRight}</span>
          </h1>
        </div>
      </div>

      {/* CONTENU : même conteneur que la Navbar, SANS double padding horizontal */}
      <div className={`relative z-10 ${CONTAINER} py-10`}>
        {/* Carte : pas de px, seulement du py pour éviter le décalage */}
        <div className=" py-6 md:py-10">
          <h2 className="text-center font-semibold tracking-wide lg:text-[20px] md:text-[18px] sm:text-[15px] text-[12px]">
            <span className="text-[#00A8E8]">BIENVENUE DANS</span>{" "}
            <span className="text-gray-900">NOTRE UNIVERS</span>
          </h2>

          {/* Zone texte : aucun px ici non plus */}
          <div className="mt-5 lg:text-[18px] md:text-[16px] sm:text-[14px] text-[12px] text-gray-700">
            <p className="mb-3">
              Bienvenue sur notre blog : des contenus courts, utiles et concrets
              pour vous aider à choisir, comparer, entretenir et profiter de vos
              achats au meilleur prix.
            </p>
            <p className="mb-3">
              Chaque article va droit au but, avec des conseils pratiques adaptés
              au marché local (prix en FCFA, disponibilité, livraison Douala/Yaoundé
              et régions), des comparatifs honnêtes, des check-lists faciles à
              suivre et des témoignages réels. Parcourez nos rubriques et trouvez
              rapidement l’info qui vous fait gagner du temps… et de l’argent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssistanceHero;
