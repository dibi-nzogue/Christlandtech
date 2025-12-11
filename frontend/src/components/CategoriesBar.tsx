// src/components/CategoriesBar.tsx
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type CategoriesBarProps = {
  items: string[];
  value?: string;
  onChange?: (v: string) => void;
  onOpenFilters?: () => void;
};

const pillBase =
  "shrink-0 snap-start inline-flex items-center rounded-full px-3.5 py-2 text-[12px] font-medium border bg-white";
const pillOn = `${pillBase} border-[#00A8E8] text-[#00A8E8]`;
const pillOff = `${pillBase} border-gray-200 text-gray-700 hover:border-[#00A8E8]`;

const CategoriesBar: React.FC<CategoriesBarProps> = ({
  items,
  value,
  onChange,
  onOpenFilters,
}) => {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const scrollBy = (x: number) =>
    scrollerRef.current?.scrollBy({ left: x, behavior: "smooth" });

  return (
    <div className="relative">
      {/* rangée (mobile = scroll horizontal ; md+ = wrap normal) */}
      <div
        ref={scrollerRef}
        className="
          -mx-4 px-4 flex gap-2 overflow-x-auto whitespace-nowrap snap-x snap-mandatory
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          md:mx-0 md:px-0 md:flex-wrap md:whitespace-normal md:overflow-visible
        "
      >
        {items.map((label) => {
          const active = value === label;
          return (
            <button
              key={label}
              type="button"
              className={active ? pillOn : pillOff}
              onClick={() => onChange?.(label === value ? "" : label)}
            >
              {label}
            </button>
          );
        })}

        {/* Bouton Filtres, visible au bout de la ligne */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="shrink-0 snap-start inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium border border-gray-200 bg-white hover:border-[#00A8E8] ml-1"
        >
          <span className="inline-block h-[10px] w-4 bg-gray-800" />
          Filtres
        </button>
      </div>

      {/* flèches et fondus – seulement sur petit écran */}
      <div className="md:hidden pointer-events-none">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-1">
          <button
            type="button"
            onClick={() => scrollBy(-180)}
            className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow"
            aria-label="Défiler à gauche"
          >
            <FiChevronLeft />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-1">
          <button
            type="button"
            onClick={() => scrollBy(180)}
            className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow"
            aria-label="Défiler à droite"
          >
            <FiChevronRight />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
};

export default CategoriesBar;
