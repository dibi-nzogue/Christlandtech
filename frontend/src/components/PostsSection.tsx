// src/components/PostsSection.tsx
import React from "react";

import img1 from "../assets/images/achat/Businesswoman.webp";
import img2 from "../assets/images/achat/Abandon.webp";
import img3 from "../assets/images/achat/Mâle.webp";
import img4 from "../assets/images/achat/Femme.webp";

type Post = {
  id: number | string;
  image: string;
  title: string;
  excerpt: string;
};

/* --- 4 cartes du haut (layout horizontal dès md) --- */
const POSTS_TOP: Post[] = [
  {
    id: 1,
    image: img1 as unknown as string,
    title: "COMMENT CHOISIR [PRODUIT] SELON VOTRE BUDGET (50–150K FCFA)",
    excerpt:
      "Un guide clair qui segmente les options par tranches de prix (<50k, ~100k, ~150k FCFA), en listant pour chacune les fonctions essentielles à exiger, les concessions possibles, et deux recommandations “meilleur rapport qualité/prix” & “valeur sûre”, avec liens directs vers les fiches et disponibilité.",
  },
  {
    id: 2,
    image: img2 as unknown as string,
    title: "COMPARATIFS & TOPS",
    excerpt:
      "Top 10 des [catégorie] en 2025 (prix, autonomie, garantie) — classement à jour avec fourchette de prix, points clés en 1 ligne, note d’autonomie et durée/conditions de garantie ; parfait pour repérer en 2 minutes les références qui valent le détour.",
  },
  {
    id: 3,
    image: img3 as unknown as string,
    title: "UTILISATION & ENTRETIEN",
    excerpt:
      "Prolonger la durée de vie de votre [catégorie] : check-list mensuelle — entretien en 10 minutes : nettoyage adapté, mises à jour, contrôle batterie/consommables, rangement/transport, et signaux d’alerte ; un petit rituel pour éviter les pannes et préserver la valeur.",
  },
  {
    id: 4,
    image: img4 as unknown as string,
    title: "INSPIRATION / CADEAUX",
    excerpt:
      "Idées cadeaux à moins de 30 000 FCFA (ou événement) — une sélection utile et sympa (petit high-tech, accessoires pratiques, déco, bien-être) avec un “pour qui/pourquoi” par idée ; options d’emballage et livraison express pour ne jamais être en retard.",
  },
];

/* --- 2 cartes du bas --- */
const POSTS_BOTTOM: Post[] = [
  {
    id: 5,
    image: img2 as unknown as string,
    title: "NOUVEAUTÉS & PROMOS",
    excerpt:
      "Sécuriser vos achats en ligne : bonnes pratiques — vérifier l’URL/avis/mentions légales, activer 3-D Secure/MFA, éviter le Wi-Fi public, repérer les arnaques et sauvegarder vos preuves d’achat ; la base pour acheter l’esprit tranquille.",
  },
  {
    id: 6,
    image: img3 as unknown as string,
    title: "CONFIANCE & LOGISTIQUE",
    excerpt:
      "Paiements acceptés : MTN MoMo, Orange Money, carte. Étapes simples et sécurisées pour chaque mode, limites/notifications, reçus, remboursement et support en cas d’erreur ; transparence totale pour payer serein.",
  },
];

/* --- Carte TOP : horizontale dès md, tailles responsives --- */
const CardTop: React.FC<{ post: Post }> = ({ post }) => (
  <div className="flex flex-col md:flex-row gap-4 sm:gap-5 p-3 rounded-xl bg-white transition h-full">
    {/* Image : pleine largeur en mobile, tailles fixes par breakpoint */}
    <div
      className="
        relative w-full aspect-[16/9]
        sm:aspect-[16/9]
        md:w-[230px] md:min-w-[230px] md:h-[150px] md:aspect-auto
        lg:w-[260px] lg:min-w-[260px] lg:h-[160px]
        xl:w-[300px] xl:min-w-[300px] xl:h-[180px]
        overflow-hidden rounded-xl border border-gray-100
      "
    >
      <img
        src={post.image}
        alt={post.title}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    </div>

    {/* Texte : tailles de police adaptatives */}
    <div className="flex-1 min-w-0">
      <h3
        className="
          font-semibold text-gray-900 uppercase leading-snug break-words
          text-[clamp(12px,2.5vw,14px)]
          sm:text-[clamp(13px,2.1vw,15px)]
          md:text-[14px]
          lg:text-[15px]
        "
      >
        {post.title}
      </h3>
      <p
        className="
          mt-2 sm:mt-3 text-gray-600 break-words leading-6
          text-[clamp(12px,2.7vw,14px)]
          sm:text-[clamp(12.5px,2.2vw,14.5px)]
          md:text-[14px]
          lg:text-[15px]
        "
      >
        {post.excerpt}
      </p>
    </div>
  </div>
);

/* --- Carte BOTTOM : verticale jusqu’à lg, horizontale à partir de lg --- */
const CardBottom: React.FC<{ post: Post }> = ({ post }) => (
  <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 p-3 rounded-xl bg-white transition h-full">
    <div
      className="
        relative w-full aspect-[16/9]
        lg:w-[260px] lg:min-w-[260px] lg:h-[160px] lg:aspect-auto
        xl:w-[300px] xl:min-w-[300px] xl:h-[180px]
        overflow-hidden rounded-xl border border-gray-100
      "
    >
      <img
        src={post.image}
        alt={post.title}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="flex-1 min-w-0">
      <h3
        className="
          font-semibold text-gray-900 uppercase leading-snug break-words
          text-[clamp(12px,2.5vw,14px)]
          md:text-[13px]
          lg:text-[14px] 
        "
      >
        {post.title}
      </h3>
      <p
        className="
          mt-2 sm:mt-3 text-gray-600 break-words leading-6
          text-[clamp(12px,2.7vw,14px)]
          md:text-[13px]
          lg:text-[14px]
        "
      >
        {post.excerpt}
      </p>
    </div>
  </div>
);

const PostsSection: React.FC = () => {
  return (
    <section className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 -mt-14">
      <h2
        className="
          font-semibold tracking-wider text-[#0086c9] uppercase
          text-[clamp(12px,2.2vw,16px)]
        "
      >
        Nos poste
      </h2>

      {/* 4 du haut */}
      <div className="mt-5 space-y-6">
        {POSTS_TOP.map((post) => (
          <CardTop key={post.id} post={post} />
        ))}
      </div>

      {/* 2 du bas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {POSTS_BOTTOM.map((post) => (
          <CardBottom key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default PostsSection;
