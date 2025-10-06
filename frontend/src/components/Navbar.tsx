// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { FaSearch, FaGlobe, FaChevronDown } from "react-icons/fa";
import logo from "../assets/images/logo.jpg";
import { useTranslation } from "react-i18next";

type LinkItem = { label: string; to: string };
const LINKS: LinkItem[] = [
  { label: "Accueil", to: "/" },
  { label: "A propos", to: "/a-propos" },
  { label: "Produits", to: "/produits" },
  { label: "Services", to: "/services" },
  { label: "Assistance", to: "/assistance" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false); 
  const [showSearch, setShowSearch] = useState(false); 
  const [langOpen, setLangOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    pathname === to || (to !== "/" && pathname.startsWith(to));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-black text-white shadow-md">
        <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        <div className="container mx-auto px-5">
          {/* Ligne principale */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 lg:gap-24 xl:gap-32 h-16 md:h-24">
            {/* Logo + nom (nom TOUJOURS visible) */}
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/10 overflow-hidden">
                <img
                  src={logo}
                  alt="CHRISTLAND TECH"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="leading-5 whitespace-nowrap">
                <span className="font-semibold tracking-wide text-[13px] sm:text-sm md:text-base">CHRISTLAND</span>{" "}
                <span className="font-extrabold text-[#00A8E8] text-[13px] sm:text-sm md:text-base">TECH</span>
              </div>
            </Link>

            {/* Recherche collée au logo (≥ md) */}
            <div className="hidden md:block justify-self-start">
              <div className="relative w-[min(360px,46vw)] lg:w-[400px] xl:w-[520px]">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder={t("Rechercher")}
                  className="w-full rounded-full bg-white py-2.5 pl-11 pr-4 text-sm md:text-[15px] text-gray-900 placeholder-gray-500 shadow-[0_10px_28px_rgba(0,0,0,0.10)] focus:outline-none"
                />
              </div>
            </div>

            {/* Actions droites (desktop) */}
            <div className="hidden md:flex items-center justify-end gap-3 sm:gap-4">
              <NavLink to="/contact" className="relative text-sm md:text-[15px]">
                <span>{t('Contact')}</span>
                <span className="absolute left-0 -bottom-1 block h-[2px] w-full bg-cyan-400 rounded-full" />
                <span>Contact</span>
                <span className="absolute left-0 -bottom-1 block h-[2px] w-full bg-[#00A8E8] rounded-full" />
              </NavLink>

              {/* Langue dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-gray-200 hover:text-white"
                >
                  <FaGlobe className="h-5 w-5" />
                  <FaChevronDown className="h-3 w-3" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-md bg-white text-gray-900 py-1 shadow-lg ring-1 ring-black/5">
                    <button
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${currentLang === "fr" ? "font-semibold text-cyan-600" : ""}`}
                      onClick={() => i18n.changeLanguage("fr")}
                    >
                      {t('Français')}
                    </button>
                    <button
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${currentLang === "en" ? "font-semibold text-cyan-600" : ""}`}
                      onClick={() => i18n.changeLanguage("en")}
                    >
                      {t('Anglais')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions mobiles : 🔍 + ☰ côte à côte à DROITE */}
            <div className="md:hidden ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setOpen(true); setShowSearch(true); }}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:text-white"
                aria-label="Ouvrir la recherche"
              >
                <FaSearch className="h-5 w-5" />
              </button>

              {!open ? (
                <button
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:text-white"
                  onClick={() => { setOpen(true); setShowSearch(false); }}
                  aria-label="Ouvrir le menu"
                >
                  <FiMenu size={22} />
                </button>
              ) : (
                <button
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:text-white"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <MdClose size={22} />
                </button>
              )}
            </div>
          </div>

          {/* Liens (≥ md) */}
          <nav className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-2 pb-3">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={`px-2 py-2 text-sm md:text-[15px] transition-colors ${
                  isActive(l.to) ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                <span className="relative">
                  {t(l.label)}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] w-full rounded-full transition-all ${
                      isActive(l.to) ? "bg-[#00A8E8] opacity-100" : "opacity-0"
                    }`}
                  />
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Overlay mobile */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden ${
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Panneau mobile = carte centrée */}
        <div
          className={`fixed top-16 left-0 right-0 z-50 flex justify-center md:hidden transition-all duration-200 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-[92%] max-w-sm rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden">
            {/* Barre du panneau */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-white/10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/10 overflow-hidden">
                <img
                  src={logo}
                  alt="CHRISTLAND TECH"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
                <span className="font-semibold text-sm">CHRISTLAND <span className="text-[#00A8E8]">TECH</span></span>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-200"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Recherche (affichée seulement si clic sur 🔍) */}
            {showSearch && (
              <div className="px-4 pt-3 pb-2 border-b border-white/10">
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Rechercher"
                    className="w-full rounded-full bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Liens */}
            <ul className="px-2 py-1">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-4 py-3 text-[15px] ${
                      isActive(l.to) ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact + langue */}
            <div className="px-4 py-3 border-t border-white/10 mt-1 flex items-center justify-between">
              <Link to="/contact" onClick={() => setOpen(false)} className="relative text-[15px]">
                <span>{t('Contact')}</span>
                <span className="absolute left-0 -bottom-1 block h-[2px] w-full bg-cyan-400 rounded-full" />
                <span>Contact</span>
                <span className="absolute left-0 -bottom-1 block h-[2px] w-full bg-[#00A8E8] rounded-full" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm ${currentLang === "fr" ? "font-semibold text-cyan-600" : ""}`}
                  onClick={() => i18n.changeLanguage("fr")}
                >
                  {t('Français')}
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm ${currentLang === "en" ? "font-semibold text-cyan-600" : ""}`}
                  onClick={() => i18n.changeLanguage("en")}
                >
                  {t('Anglais')}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* espace sous le header fixed */}
      <div className="h-16 md:h-20" />
    </>
  );
};

export default Navbar;
