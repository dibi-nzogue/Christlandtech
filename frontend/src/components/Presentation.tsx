// src/components/Presentation.tsx
import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import iphone from "../assets/images/iphone.jfif";
import { useTranslation } from "react-i18next";

/* ------------------- Types ------------------- */
type Option = { label: string; value: string };
type Filter = { title: string; options: Option[] };

const ACCENT = "bg-[#00A8E8] text-white border-[#00A8E8]";
const ACCENT_HOVER = "hover:opacity-90";

/* ------------------- Filtres (options) ------------------- */
const brandOptions: Option[] = [
  { label: "SAMSUNG", value: "samsung" },
  { label: "HP", value: "hp" },
  { label: "LENOVO", value: "lenovo" },
  { label: "BENQ", value: "benq" },
];

const screenOptions: Option[] = [
  { label: '6.1"', value: "6.1" },
  { label: '6.4"', value: "6.4" },
  { label: '13"', value: "13" },
  { label: '14"', value: "14" },
  { label: '15.6"', value: "15.6" },
  { label: '16"', value: "16" },
  { label: '24"', value: "24" },
  { label: '27"', value: "27" },
  { label: '32"', value: "32" },
];

const cpuOptions: Option[] = [
  { label: "A17", value: "a17" },
  { label: "Snapdragon", value: "snapdragon" },
  { label: "Intel i5", value: "i5" },
  { label: "Intel i7", value: "i7" },
  { label: "Ryzen 5", value: "ryzen5" },
];

const ramOptions: Option[] = [
  { label: "8 Go", value: "8" },
  { label: "16 Go", value: "16" },
];

const ssdOptions: Option[] = [
  { label: "256 Go", value: "256" },
  { label: "512 Go", value: "512" },
  { label: "1 To", value: "1024" },
];

const colorOptions: Option[] = [
  { label: "Noir", value: "noir" },
  { label: "Argent", value: "argent" },
  { label: "Bleu", value: "bleu" },
  { label: "Vert", value: "vert" },
];

const FILTERS: Filter[] = [
  { title: "MARQUE", options: brandOptions },
  { title: "TAILLE DE L’ECRAN", options: screenOptions },
  { title: "PROCESSEUR", options: cpuOptions },
  { title: "MÉMOIRE VIVE", options: ramOptions },
  { title: "CAPACITÉ SSD", options: ssdOptions },
  { title: "COULEURS", options: colorOptions },
];

/* ------------------- Catégories (carrousel) ------------------- */
const categories = [
  "Ordinateur",
  "Téléphones & Tablettes",
  "Électroménager",
  "Electronique",
  "Bureau et Maison",
  "Cinématographie",
  "Gaming et jeux vidéo",
  "Réseau télécom / Sécurité",
];

/* ------------------- Produits ------------------- */
type Product = {
  id: number;
  name: string;
  img: string;
  desc: string;
  category: string;
  brand?: string; screen?: string; cpu?: string; ram?: string; ssd?: string; color?: string;
  price: number;
  oldPrice?: number;
};

const products: Product[] = [
  { id: 1, category: "Téléphones & Tablettes", brand: "samsung", name: "Galaxy S23",
    price: 200000, oldPrice: 220000,
    img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e5?q=80&w=800&auto=format&fit=crop",
    desc: "Écran 6.1” • Snapdragon • 128 Go • 5G", screen:"6.1", cpu:"snapdragon", ram:"8", ssd:"256", color:"noir" },
  { id: 9, category: "Téléphones & Tablettes", brand: "samsung", name: "Galaxy A54",
    price: 150000, oldPrice: 175000,
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
    desc: "6.4” • 8Go • 256Go • 5G", screen:"6.4", cpu:"snapdragon", ram:"8", ssd:"256", color:"vert" },
  { id: 2, category: "Electronique", brand: "samsung", name: "TV 32” HD",
    price: 90000,
    img: "https://images.unsplash.com/photo-1584946488603-84f9eb6c4f3b?q=80&w=800&auto=format&fit=crop",
    desc: "LED • HDMI/USB • Mode jeu", screen:"32", color:"noir" },
  { id: 3, category: "Ordinateur", brand: "hp", name: "HP 15s",
    price: 260000,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    desc: "15.6” • i5 • 8Go • 256Go SSD", screen:"15.6", cpu:"i5", ram:"8", ssd:"256", color:"argent" },
  { id: 4, category: "Ordinateur", brand: "hp", name: "HP Envy",
    price: 450000, oldPrice: 480000,
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    desc: "13” • i7 • 16Go • 512Go SSD", screen:"13", cpu:"i7", ram:"16", ssd:"512", color:"noir" },
  { id: 5, category: "Ordinateur", brand: "lenovo", name: "Lenovo IdeaPad",
    price: 230000,
    img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    desc: "14” • Ryzen 5 • 8Go • 512Go SSD", screen:"14", cpu:"ryzen5", ram:"8", ssd:"512", color:"argent" },
  { id: 6, category: "Ordinateur", brand: "lenovo", name: "Lenovo Legion",
    price: 650000, oldPrice: 720000,
    img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
    desc: "15.6” • i7 • 16Go • 1To SSD", screen:"15.6", cpu:"i7", ram:"16", ssd:"1024", color:"noir" },
  { id: 7, category: "Electronique", brand: "benq", name: "BenQ 27” 144Hz",
    price: 180000,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    desc: "27” • 144Hz • IPS • 1ms", screen:"27", color:"noir" },
  { id: 8, category: "Electronique", brand: "benq", name: "BenQ 24” FHD",
    price: 120000,
    img: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=800&auto=format&fit=crop",
    desc: "24” • 75Hz • Low Blue Light", screen:"24", color:"noir" },
  { id: 10, category: "Ordinateur", brand: "hp", name: "HP Victus",
    price: 520000,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    desc: "16” • i7 • 16Go • 512Go SSD", screen:"16", cpu:"i7", ram:"16", ssd:"512", color:"bleu" },
];

/* ------------------- Sous-composants ------------------- */
type FilterGroupProps = Filter & {
  selected?: string;
  onSelect: (title: string, v: string) => void;
};

const FilterGroup: React.FC<FilterGroupProps> = ({ title, options, selected, onSelect }) => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between mt-8 select-none cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        role="button"
        aria-expanded={open}
      >
        <h4 className="text-sm font-semibold tracking-wide text-gray-700">{title}</h4>
        <button
          type="button"
          aria-label={open ? "Réduire" : "Déployer"}
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          className="relative p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A8E8]"
        >
          <span className={["block h-1 rounded-full bg-[#00A8E8] transition-all duration-300", open ? "w-5" : "w-8"].join(" ")} />
        </button>
      </div>

      <div className="mt-2 border-t border-[#00A8E8]" />

      {/* Collapsible content */}
      <div className={["grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"].join(" ")}>
        <div className="overflow-hidden">
          <div className="mt-3 space-y-2 text-sm">
            {options.map((opt) => {
              const isChecked = selected === opt.value;
              return (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    key={`${title}-${opt.value}-${isChecked ? "on" : "off"}`}
                    type="radio"
                    name={title}
                    value={opt.value}
                    checked={isChecked}
                    onClick={(e) => {
                      if (isChecked) {
                        e.preventDefault();
                        onSelect(title, "");
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                    onChange={() => { if (!isChecked) onSelect(title, opt.value); }}
                    className="h-4 w-4 rounded-full border border-gray-300 accent-gray-300 checked:accent-[#00A8E8] transition-all duration-200"
                  />
                  <span className={`transition-colors duration-200 ${isChecked ? "text-[#00A8E8] font-semibold" : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const fmt = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

const ProductCard: React.FC<Product> = ({ name, price, oldPrice, img, desc }) => (
  <article className="group rounded-2xl border border-gray-200 bg-white p-4 shadow transition-shadow hover:shadow-lg">
    <div className="w-full h-44 md:h-48 lg:h-52 overflow-hidden rounded-xl border border-gray-100">
      <img
        src={img}
        alt={name}
        className="h-full w-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='16'%3EImage indisponible%3C/text%3E%3C/svg%3E";
        }}
      />
    </div>

    <h3 className="mt-3 text-[15px] sm:text-base font-semibold text-gray-900">{name}</h3>
    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{desc}</p>

    <div className="mt-3 flex items-center justify-between">
      <span className="text-xl sm:text-xl md:text-sm lg:text-2xl font-bold text-gray-900">{fmt(price)}</span>
      {typeof oldPrice === "number" && oldPrice > price && (
        <span className="text-sm sm:text-base md:text-text-base lg:text-lg text-red-500 line-through">{fmt(oldPrice)}</span>
      )}
    </div>

    <div className="mt-3 flex items-center justify-center">
      <button className={`rounded-lg border px-3 py-1.5 text-sm sm:text-md font-medium ${ACCENT} ${ACCENT_HOVER}`}>
        Commander
      </button>
    </div>
  </article>
);

/* ------------------- Page ------------------- */
const Presentation: React.FC = () => {
  /** Carrousel catégories (desktop) */
  const VISIBLE = 6.5;
  const ITEM_W = 160;
  const GAP = 16;
  const STEP = ITEM_W + GAP;

  const [index, setIndex] = React.useState(0);
  const maxIndex = Math.max(0, categories.length - VISIBLE);
  const canPrev = index > 0;
  const canNext = index < maxIndex;
  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setIndex((i) => Math.min(i + 1, maxIndex));

  /** État filtres */
  const [filters, setFilters] = React.useState<Record<string, string>>({
    MARQUE: "",
    "TAILLE DE L’ECRAN": "",
    PROCESSEUR: "",
    "MÉMOIRE VIVE": "",
    "CAPACITÉ SSD": "",
    COULEURS: "",
  });

  const keyMap: Record<string, keyof Product> = {
    MARQUE: "brand",
    "TAILLE DE L’ECRAN": "screen",
    PROCESSEUR: "cpu",
    "MÉMOIRE VIVE": "ram",
    "CAPACITÉ SSD": "ssd",
    COULEURS: "color",
  };

  const handleSelect = (title: string, value: string) =>
    setFilters((f) => ({ ...f, [title]: value }));

  /** Catégorie active */
  const [activeCategory, setActiveCategory] = React.useState<string>("");

  /** Filtrage combiné */
  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      return Object.entries(filters).every(([group, val]) => {
        if (!val) return true;
        const key = keyMap[group];
        if (!key) return true;
        return (p as any)[key] === val;
      });
    });
  }, [filters, activeCategory]);

  /** Pagination */
  const PAGE_SIZE = 12;
  const [page, setPage] = React.useState(1);
  React.useEffect(() => { setPage(1); }, [filters, activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const visibleProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goto = (n: number) => setPage(Math.min(Math.max(1, n), totalPages));

  /** Tiroir filtres mobile */
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  React.useEffect(() => {
    // lock scroll when drawer open
    if (mobileFiltersOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileFiltersOpen]);

  const { t } = useTranslation();

  return (
    <>
      {/* ===== ENTÊTE ===== */}
      <div className="w-full bg-gray-100">
        <div className="container mx-auto px-5">
          <div className="flex items-center justify-between h-40 md:h-40 lg:h-48 ">
            <div className="min-w-0 mt-6">
              <div className="text-xs sm:text-sm text-gray-500">
                {t('Accueil')} <span className="text-gray-400">›</span> {t('Produits')}
              </div>
              <h1 className="mt-1 font-extrabold leading-tight tracking-tight text-xl sm:text-xl md:text-2xl lg:text-4xl">
                Explore Tous Les Produits
              </h1>
            </div>
            <div className=" sm:block">
              <div className="h-20 md:h-24 lg:h-28 xl:h-32 w-auto">
                <img
                  src={iphone}
                  alt="Produit vedette"
                  className="h-full w-auto object-contain pointer-events-none select-none"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CATÉGORIES ===== */}
      <div className="container mx-auto px-5 pt-10">
        <div className="uppercase tracking-wider text-xs font-semibold text-gray-600 mb-2">
          Catégories
        </div>

        {/* Mobile: simple scroll horizontal */}
        <div className="md:hidden -mx-5 px-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 pb-1">
            {categories.map((c) => {
              const active = activeCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCategory(active ? "" : c)}
                  className={[
                    "flex-none px-3 h-9 rounded-md border text-sm font-medium",
                    active ? ACCENT : "bg-[#83888a] text-white border-[#83888a] hover:bg-[#b9c6ca]"
                  ].join(" ")}
                  title={c}
                >
                  <span className="truncate max-w-[160px]">{c}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: carrousel avec flèches */}
        <div className="hidden md:flex items-center gap-6">
          <div
            className="overflow-hidden"
            style={{ width: `${VISIBLE * ITEM_W + VISIBLE * GAP}px` }}
          >
            <div
              className="flex gap-4 transition-transform duration-300 ease-out"
              style={{
                width: `${categories.length * STEP}px`,
                transform: `translateX(-${index * STEP}px)`,
              }}
            >
              {categories.map((c) => {
                const active = activeCategory === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(active ? "" : c)}
                    className={[
                      "w-40 h-10 flex-none rounded-md border text-sm font-medium text-center",
                      active ? ACCENT : "bg-[#83888a] text-white border-[#83888a] hover:bg-[#b9c6ca]",
                    ].join(" ")}
                    title={c}
                  >
                    <span className="block px-2 truncate">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canPrev}
              aria-label="Précédent"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-gray-700 ${
                canPrev ? "border-gray-200 hover:border-[#0a8fc3]" : "border-gray-100 opacity-40 cursor-not-allowed"
              }`}
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext}
              aria-label="Suivant"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-gray-700 ${
                canNext ? "border-gray-200 hover:border-[#0a8fc3]" : "border-gray-100 opacity-40 cursor-not-allowed"
              }`}
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== BARRE D’ACTION (Mobile) : bouton Filtres (3 traits) ===== */}
      <div className="container mx-auto px-5 mt-4 md:mt-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm active:scale-[0.99]"
          aria-label="Ouvrir les filtres"
        >
          <FiMenu className="h-5 w-5" />
          Filtres
        </button>
      </div>

      {/* ===== CONTENU (Sidebar desktop + Grille) ===== */}
      <div className="bg-white">
        <div className=" max-w-screen-4xl mx-auto px-5  py-6 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar desktop */}
            <aside className="hidden lg:block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-gray-900">Filtrer</h3>
              <div className="mt-4 border-t border-[#00A8E8] pt-4">
                {FILTERS.map((f) => (
                  <FilterGroup
                    key={f.title}
                    {...f}
                    selected={filters[f.title] ?? ""}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </aside>

            {/* Produits + pagination */}
            <main className="lg:col-span-3">
              {/* Grille responsive : 1 col <640px (résout ton 1er screenshot) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {visibleProducts.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>

              {/* Pagination */}
              {filtered.length > 12 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-[#00A8E8]"
                    onClick={() => goto(page - 1)}
                    disabled={page === 1}
                    aria-label="Page précédente"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((n) => (
                    <button
                      key={n}
                      onClick={() => goto(n)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                        n === page
                          ? `${ACCENT} ${ACCENT_HOVER}`
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#00A8E8]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-[#00A8E8]"
                    onClick={() => goto(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Page suivante"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* ===== TIROIR FILTRES — MOBILE ===== */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-[9999]"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[360px] bg-white shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold">Filtrer</h3>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setMobileFiltersOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-[#00A8E8] pt-4">
              {FILTERS.map((f) => (
                <FilterGroup
                  key={f.title}
                  {...f}
                  selected={filters[f.title] ?? ""}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {/* Actions bas du tiroir */}
            <div className="sticky bottom-0 -mx-5 mt-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-5 border-t">
              <div className="flex gap-3">
                <button
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${ACCENT} ${ACCENT_HOVER}`}
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Appliquer
                </button>
                <button
                  className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium bg-white text-gray-700 border-gray-200 hover:border-[#00A8E8]"
                  onClick={() =>
                    setFilters({
                      MARQUE: "",
                      "TAILLE DE L’ECRAN": "",
                      PROCESSEUR: "",
                      "MÉMOIRE VIVE": "",
                      "CAPACITÉ SSD": "",
                      COULEURS: "",
                    })
                  }
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Presentation;
