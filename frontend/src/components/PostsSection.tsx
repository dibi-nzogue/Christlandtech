
import React from "react";
import { useBlogPosts, media } from "../hooks/useFetchQuery";
import { motion } from "framer-motion";
import type { Variants, Transition } from "framer-motion";

type Post = {
  id: number | string;
  image: string;
  title: string;   // <- affichera "extrait" / "excerpt"
  excerpt: string; // <- affichera "contenu" / "content"
};

// ✅ Fallback très léger si l’API ne renvoie pas d’image
const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='16'%3EImage%20indisponible%3C/text%3E%3C/svg%3E";

// Transitions/variants
const TWEEN_SLOW: Transition = {
  type: "tween",
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

const pageEnter: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: TWEEN_SLOW },
};

const cardFadeUpOnView: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/* --- Carte TOP : horizontale dès md --- */
const CardTop: React.FC<{ post: Post }> = ({ post }) => {
  const imgSrc = post.image || FALLBACK_IMG;

  return (
    <motion.div
      variants={cardFadeUpOnView}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="flex flex-col md:flex-row gap-4 sm:gap-5 p-3 rounded-xl bg-white transition h-full"
    >
      {/* DIV image = zone de hover-zoom (seulement l'image) */}
      <div
        className="
          relative w-full aspect-[16/9]
          sm:aspect-[16/9]
          md:w-[230px] md:min-w-[230px] md:h-[150px] md:aspect-auto
          lg:w-[260px] lg:min-w-[260px] lg:h-[160px]
          xl:w-[300px] xl:min-w-[300px] xl:h-[180px]
          overflow-hidden rounded-xl border border-gray-100
          group
        "
        role="img"
        aria-label={post.title}
        title={post.title}
      >
        <img
          width={300}
          height={300}
          src={imgSrc}
          alt={post.title}
          className="
            absolute inset-0 h-full w-full object-cover
            transform transition-transform duration-500 will-change-transform
            group-hover:scale-110
          "
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.src !== FALLBACK_IMG) {
              img.src = FALLBACK_IMG;
            }
          }}
        />
      </div>

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
    </motion.div>
  );
};

/* --- Carte BOTTOM : verticale jusqu’à lg, horizontale à partir de lg --- */
const CardBottom: React.FC<{ post: Post }> = ({ post }) => {
  const imgSrc = post.image || FALLBACK_IMG;

  return (
    <motion.div
      variants={cardFadeUpOnView}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="flex flex-col lg:flex-row gap-4 sm:gap-5 p-3 rounded-xl bg-white transition h-full"
    >
      {/* DIV image = zone de hover-zoom (seulement l'image) */}
      <div
        className="
          relative w-full aspect-[16/9]
          lg:w-[260px] lg:min-w-[260px] lg:h-[160px] lg:aspect-auto
          xl:w-[300px] xl:min-w-[300px] xl:h-[180px]
          overflow-hidden rounded-xl border border-gray-100
          group
        "
        role="img"
        aria-label={post.title}
        title={post.title}
      >
        <img
          width={300}
          height={300}
          src={imgSrc}
          alt={post.title}
          className="
            absolute inset-0 h-full w-full object-cover
            transform transition-transform duration-500 will-change-transform
            group-hover:scale-110
          "
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.src !== FALLBACK_IMG) {
              img.src = FALLBACK_IMG;
            }
          }}
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
    </motion.div>
  );
};

const PostsSection: React.FC = () => {
  const { data } = useBlogPosts(); // 👈 loader global géré ailleurs

  // image  <- image / image_couverture
  // title  <- excerpt / extrait
  // excerpt<- content / contenu
  const postsTop: Post[] = React.useMemo(() => {
    const items = data?.top ?? [];
    return items.map((a: any) => {
      const rawImage =
        a.image || a.image_couverture || "";
      const img = rawImage ? media(rawImage) : "";
      const title =
        a.excerpt || a.extrait || "";
      const body =
        a.content || a.contenu || "";

      return {
        id: a.id,
        image: img || FALLBACK_IMG,
        title: title,
        excerpt: body,
      };
    });
  }, [data?.top]);

  const postsBottom: Post[] = React.useMemo(() => {
    const items = data?.bottom ?? [];
    return items.map((a: any) => {
      const rawImage =
        a.image || a.image_couverture || "";
      const img = rawImage ? media(rawImage) : "";
      const title =
        a.excerpt || a.extrait || "";
      const body =
        a.content || a.contenu || "";

      return {
        id: a.id,
        image: img || FALLBACK_IMG,
        title: title,
        excerpt: body,
      };
    });
  }, [data?.bottom]);

  if (!postsTop.length && !postsBottom.length) {
    // Si aucun article, on évite un gros bloc vide
    return null;
  }

  return (
    <motion.section
      className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 -mt-14"
      variants={pageEnter}
      initial="hidden"
      animate="show"
    >
      <h2
        className="
          font-semibold tracking-wider text-[#0086c9] uppercase
          text-[clamp(12px,2.2vw,16px)]
        "
      >
        Nos articles
      </h2>

      {/* 4 du haut */}
      <div className="mt-5 space-y-6">
        {postsTop.map((post) => (
          <CardTop key={post.id} post={post} />
        ))}
      </div>

      {/* 2 du bas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {postsBottom.map((post) => (
          <CardBottom key={post.id} post={post} />
        ))}
      </div>
    </motion.section>
  );
};

export default PostsSection;
