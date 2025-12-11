// src/seo/categorySeo.ts
export type CategorySlug =
  | "ordinateurs-informatique"
  | "telephones-tablettes"
  | "electromenager"
  | "electronique-energie"
  | "gaming-jeux-video"
  | "cinematographie-photo-video"
  | "bureau-maison"
  | "reseau-telecom-securite"
  | "outillage-epi";

export interface CategorySeo {
  slug: CategorySlug;
  title: string;          // balise <title>
  description: string;    // meta description
  keywords: string[];     // meta keywords (optionnel mais pratique pour toi)
}

// 🔥 Config SEO centrale pour toutes les catégories
export const CATEGORY_SEO: Record<CategorySlug, CategorySeo> = {
  "ordinateurs-informatique": {
    slug: "ordinateurs-informatique",
    title: "Ordinateurs & Informatique | Christland Tech",
    description:
      "Achetez vos ordinateurs portables, PC de bureau, écrans, imprimantes et accessoires informatiques chez Christland Tech. Produits garantis, prix compétitifs et livraison rapide au Cameroun.",
    keywords: [
      "ordinateur portable",
      "pc bureau",
      "ordinateur gamer",
      "accessoires informatiques",
      "écran pc",
      "imprimante",
      "matériel informatique Cameroun"
    ]
  },

  "telephones-tablettes": {
    slug: "telephones-tablettes",
    title: "Téléphones & Tablettes | Christland Tech",
    description:
      "Smartphones Android, iPhone, tablettes et accessoires mobiles au meilleur prix. Découvrez la sélection Christland Tech et faites-vous livrer partout au Cameroun.",
    keywords: [
      "smartphone",
      "téléphone portable",
      "iphone",
      "tablette tactile",
      "accessoires téléphone",
      "écouteurs bluetooth",
      "téléphone Cameroun"
    ]
  },

  "electromenager": {
    slug: "electromenager",
    title: "Électroménager | Christland Tech",
    description:
      "Réfrigérateurs, congélateurs, machines à laver, cuisinières, micro-ondes et petit électroménager pour équiper votre maison. Produits de qualité et service après-vente chez Christland Tech.",
    keywords: [
      "réfrigérateur",
      "congélateur",
      "machine à laver",
      "cuisinière",
      "micro ondes",
      "électroménager maison",
      "équipement cuisine"
    ]
  },

  "electronique-energie": {
    slug: "electronique-energie",
    title: "Électronique & Énergie | Christland Tech",
    description:
      "Onduleurs, multiprises, batteries, panneaux solaires, régulateurs de tension et solutions d’alimentation pour sécuriser vos équipements. Découvrez les solutions énergie de Christland Tech.",
    keywords: [
      "onduleur",
      "batterie",
      "panneau solaire",
      "régulateur de tension",
      "stabilisateur",
      "multiprise",
      "énergie solaire"
    ]
  },

  "gaming-jeux-video": {
    slug: "gaming-jeux-video",
    title: "Gaming & Jeux vidéo | Christland Tech",
    description:
      "Consoles de jeux, manettes, casques gaming, accessoires et jeux vidéo pour PS5, PS4, Xbox et PC. Tout l’univers gaming chez Christland Tech.",
    keywords: [
      "console de jeux",
      "ps5",
      "ps4",
      "xbox",
      "jeux vidéo",
      "casque gaming",
      "manette jeu"
    ]
  },

  "cinematographie-photo-video": {
    slug: "cinematographie-photo-video",
    title: "Cinématographie (Photo & Vidéo) | Christland Tech",
    description:
      "Appareils photo, caméras, trépieds, éclairages, microphones et accessoires pour créateurs de contenu, vidéastes et photographes. Matériel pro et semi-pro chez Christland Tech.",
    keywords: [
      "appareil photo",
      "caméra",
      "trépied",
      "ring light",
      "microphone",
      "matériel vidéo",
      "accessoires photo"
    ]
  },

  "bureau-maison": {
    slug: "bureau-maison",
    title: "Bureau & Maison | Christland Tech",
    description:
      "Chaises de bureau, bureaux, rangements, lampes, accessoires de travail et organisation pour votre espace maison ou entreprise.",
    keywords: [
      "chaise de bureau",
      "bureau informatique",
      "accessoires bureau",
      "organisation bureau",
      "lampe de bureau",
      "mobilier bureau"
    ]
  },

  "reseau-telecom-securite": {
    slug: "reseau-telecom-securite",
    title: "Réseau, Télécom & Sécurité | Christland Tech",
    description:
      "Routeurs, modems, switches, câbles réseau, caméras de surveillance et systèmes de sécurité pour maison et entreprise.",
    keywords: [
      "routeur wifi",
      "modem",
      "switch réseau",
      "câble ethernet",
      "caméra de surveillance",
      "kit vidéosurveillance",
      "sécurité maison"
    ]
  },

  "outillage-epi": {
    slug: "outillage-epi",
    title: "Outillage & EPI | Christland Tech",
    description:
      "Outils électriques, outillage à main, équipements de protection individuelle (EPI) pour artisans, techniciens et professionnels.",
    keywords: [
      "outillage",
      "outils électriques",
      "perceuse",
      "tournevis",
      "équipements de protection",
      "casque de sécurité",
      "gants de travail"
    ]
  }
};
