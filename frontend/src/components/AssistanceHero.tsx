// src/components/AssistanceHero.tsx
import React from "react";
import imgMerci from "../assets/images/achat/𝕮𝖔𝖒𝖕𝖚𝖙𝖊𝖗𝕸𝖔𝖈𝖐.webp";
import { useBlogHero } from "../hooks/useFetchQuery"; // ✅ on récupère title & slug

type Props = {
  titleLeft?: string;
  titleRight?: string;
};

const CONTAINER =
  "mx-auto max-w-screen-2xl px-6 sm:px-8 lg:px-10"; // => DOIT être le même que dans la Navbar

// découpe le titre en 2 segments (premier mot / le reste) pour garder 2 spans
function splitTitle(title?: string | null) {
  const t = (title || "").trim();
  if (!t) return { first: "BIENVENUE", rest: "DANS NOTRE UNIVERS" };
  const [first, ...restArr] = t.split(/\s+/);
  return { first: first || "", rest: restArr.join(" ") || "" };
}

const AssistanceHero: React.FC<Props> = ({
  titleLeft = "ARTICLE",
  titleRight = "BLOG",
}) => {
  // ⚡ charge { title, slug } depuis /api/blog/hero/
  const { data: hero, loading } = useBlogHero();
  const { first, rest } = React.useMemo(() => splitTitle(hero?.title), [hero?.title]);

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
          {/* ⬇️ H2 — récupéré depuis TITRE (2 spans, couleurs conservées) */}
          <h2 className="text-center font-semibold tracking-wide lg:text-[20px] md:text-[18px] sm:text-[15px] text-[12px]">
            {loading && !hero?.title ? (
              <>
                <span className="text-[#00A8E8]">Chargement</span>{" "}
                <span className="text-gray-900">…</span>
              </>
            ) : (
              <>
                <span className="text-[#00A8E8]">{first}</span>{" "}
                <span className="text-gray-900">{rest}</span>
              </>
            )}
          </h2>

          {/* ⬇️ Zone texte — remplace les paragraphes par le champ SLUG */}
          <div className="mt-5 lg:text-[18px] md:text-[16px] sm:text-[14px] text-[12px] text-gray-700">
            {loading && !hero?.slug ? (
              <p className="mb-3 opacity-70">Chargement…</p>
            ) : (
              <p className="mb-3 break-words">{hero?.slug || ""}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssistanceHero;
