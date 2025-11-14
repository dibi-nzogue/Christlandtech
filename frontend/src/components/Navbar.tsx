import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { FaSearch, FaGlobe, FaChevronDown } from "react-icons/fa";
import logo from "../assets/images/logo.jpg";
import { useTranslation } from "react-i18next";
import { setUiLang } from "../i18nLang";

type LinkItem = { label: string; to: string };

const LINKS: LinkItem[] = [
  { label: "Accueil", to: "/" },
  { label: "A propos", to: "/a-propos" },
  { label: "Produits", to: "/produits" },
  { label: "Services", to: "/services" },
  { label: "Assistance", to: "/assistance" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false); // panneau mobile
  const [showSearch, setShowSearch] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // --- Nouveau: afficher le nom uniquement si non tronqué
  const [showName, setShowName] = useState(true);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);

  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();

  // champ de recherche (desktop + mobile)
  const [q, setQ] = useState("");

  // si on est sur /produits, synchroniser l’input avec ?q présent dans l’URL
  useEffect(() => {
    if (pathname.startsWith("/produits")) {
      setQ((urlSearchParams.get("q") || "").trim());
    } else {
      setQ(""); // hors de /produits on ne garde pas le terme
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, urlSearchParams]);

  const submitSearch = () => {
    const term = q.trim();
    if (!term) {
      navigate("/produits", { replace: false });
      return;
    }
    navigate(`/produits?q=${encodeURIComponent(term)}&page=1`);
  };

  const isActive = (to: string) => pathname === to || (to !== "/" && pathname.startsWith(to));

  // lock scroll quand le panneau mobile est ouvert
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // html lang (accessibilité/i18n)
  useEffect(() => {
    document.documentElement.lang = i18n.language?.startsWith("en") ? "en" : "fr";
  }, [i18n.language]);

  // --- Détection d’overflow pour masquer le nom si nécessaire
  const recomputeNameVisibility = () => {
    const el = nameRef.current;
    if (!el) return;
    // si le contenu dépasse la largeur disponible, on masque le texte
    const willTruncate = el.scrollWidth > el.clientWidth;
    setShowName(!willTruncate);
  };

  useEffect(() => {
    recomputeNameVisibility(); // au premier rendu
  }, []);

  useEffect(() => {
    // re-check quand la langue change (longueur du texte)
    recomputeNameVisibility();
  }, [i18n.language]);

  useEffect(() => {
    // observe les redimensionnements
    if (!linkRef.current) return;
    const ro = new ResizeObserver(() => {
      recomputeNameVisibility();
    });
    ro.observe(linkRef.current);
    if (nameRef.current) ro.observe(nameRef.current);

    // fallback window resize
    const onR = () => recomputeNameVisibility();
    window.addEventListener("resize", onR);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onR);
    };
  }, []);

  const currentLang = i18n.language;

  return (
    <>
      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 bg-black text-white shadow-md md:pt-5">
        <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
          {/* Ligne principale */}
          <div
            className="
              grid grid-cols-[auto_1fr_auto] items-center
              gap-2 sm:gap-3 md:gap-6 lg:gap-10 xl:gap-16
              h-16 md:h-20 lg:h-24
            "
          >
            {/* Logo + nom (nom masqué si overflow) */}
            <Link
              ref={linkRef}
              to="/"
              className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 min-w-0"
              aria-label="CHRISTLAND TECH"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full bg-white overflow-hidden flex-shrink-0">
                <img
                  src={logo}
                  alt=""
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Texte visible seulement s’il rentre ENTIEREMENT */}
              {showName ? (
                <div
                  ref={nameRef}
                  className="
                    leading-tight text-white font-semibold whitespace-nowrap
                    overflow-hidden
                    max-w-[46vw] md:max-w-[52vw] lg:max-w-none
                  "
                  // NB: pas de 'truncate' ici pour mesurer scrollWidth vs clientWidth
                >
                  <span className="text-[12px] sm:text-[13px] md:text-[15px] lg:text-[17px] tracking-wide">
                    CHRISTLAND
                  </span>{" "}
                  <span className="text-[#00A8E8] text-[12px] sm:text-[13px] md:text-[15px] lg:text-[17px] font-extrabold">
                    TECH
                  </span>
                </div>
              ) : (
                // Accessibilité : garder le nom lisible par les lecteurs d’écran
                <span className="sr-only">CHRISTLAND TECH</span>
              )}
            </Link>

            {/* Recherche (≥ md) */}
            <div className="hidden md:block md:justify-self-center lg:justify-self-start">
              <div className="relative w-[min(360px,46vw)] lg:w-[400px] xl:w-[520px]">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
  type="search"
  value={q}
  onChange={(e) => {
    const value = e.target.value;
    setQ(value);

    // ➜ si on est sur /produits et que le champ est vidé,
    // on enlève le filtre et on recharge tous les produits
    if (pathname.startsWith("/produits") && value.trim() === "") {
      navigate("/produits", { replace: true });
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
  }}
  placeholder={t("Rechercher")}
  aria-label={t("Rechercher")}
  className="w-full rounded-full bg-white py-2.5 pl-11 pr-4 text-sm md:text-[15px] text-gray-900 placeholder-gray-500 shadow-[0_10px_28px_rgba(0,0,0,0.10)] focus:outline-none"
/>

              </div>
            </div>

            {/* Actions droites (desktop) */}
            <div className="hidden md:flex items-center justify-end gap-3 sm:gap-4">
              <button
                type="button"
                className="relative text-sm md:text-[15px] cursor-pointer"
                onClick={() => {
                  const contactSection = document.getElementById("contact");
                  contactSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>{t("Contact")}</span>
                <span className="absolute left-0 -bottom-2 block h-[4px] w-full bg-[#00A9DC]" />
              </button>

              <div className="bg-white py-4 pr-1" />

              {/* Langue dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-white"
                >
                  <FaGlobe className="h-5 w-5" />
                  <FaChevronDown className="h-3 w-3" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-md bg-white text-gray-900 py-1 shadow-lg ring-1 ring-black/5">
                    <button
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                        currentLang === "fr" ? "font-semibold text-[#00A9DC]" : ""
                      }`}
                      onClick={() => {
                        i18n.changeLanguage("fr");
                        setUiLang("fr");
                        setLangOpen(false);
                        recomputeNameVisibility(); // re-check car longueur peut changer
                      }}
                    >
                      {t("Français")}
                    </button>
                    <button
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                        currentLang === "en" ? "font-semibold text-[#00A9DC]" : ""
                      }`}
                      onClick={() => {
                        i18n.changeLanguage("en");
                        setUiLang("en");
                        setLangOpen(false);
                        recomputeNameVisibility();
                      }}
                    >
                      {t("Anglais")}
                    </button>
                  </div>
                )}
              </div>
            </div>

                        {/* Actions mobiles (affichées seulement quand le panneau est FERME) */}
            {!open && (
              <div className="md:hidden ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(true);
                    setShowSearch(true);
                  }}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:text-white"
                  aria-label="Ouvrir la recherche"
                >
                  <FaSearch className="h-5 w-5" />
                </button>

                <button
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 hover:text-white"
                  onClick={() => {
                    setOpen(true);
                    setShowSearch(false);
                  }}
                  aria-label="Ouvrir le menu"
                >
                  <FiMenu size={22} />
                </button>
              </div>
            )}

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
                <span className="relative text-sm md:text-base font-bold">
                  {t(l.label)}
                  <span
                  className={`absolute left-0 -bottom-1 h-[4px] w-full transition-all duration-300 ease-in-out origin-left ${
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

        {/* Panneau mobile */}
        <div
          className={`fixed top-16 left-0 right-0 z-50 flex justify-center md:hidden transition-all duration-200 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-[92%] max-w-sm rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden">
            {/* Barre du panneau */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex-shrink-0">
                  <img src={logo} alt="" className="h-full w-full object-contain" />
                </div>
                <span className="font-semibold text-md whitespace-nowrap truncate">
                  CHRISTLAND <span className="text-[#00A9E8]">TECH</span>
                </span>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-200"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Recherche mobile (si clic sur 🔍) */}
            {showSearch && (
              <div className="px-4 pt-3 pb-2 border-b border-white/10">
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => {
                      const value = e.target.value;
                      setQ(value);

                      // ➜ si on vide le champ pendant qu'on est sur /produits,
                      // on réinitialise la liste des produits
                      if (pathname.startsWith("/produits") && value.trim() === "") {
                        navigate("/produits", { replace: true });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitSearch();
                        setOpen(false);
                      }
                    }}
                    placeholder={t("Rechercher")}
                    aria-label={t("Rechercher")}
                    className="w-full rounded-full bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-500"
                    autoFocus
                  />

                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="flex-1 rounded-md bg-white text-neutral-900 px-3 py-2 text-sm"
                    onClick={() => {
                      submitSearch();
                      setOpen(false);
                    }}
                  >
                    {t("Rechercher")}
                  </button>
                  {q && (
                    <button
                      className="rounded-md px-3 py-2 text-sm bg-white/10 text-white"
                      onClick={() => {
                        setQ("");
                        navigate("/produits");
                        setOpen(false);
                      }}
                    >
                      {t("see.less")}
                    </button>
                  )}
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
                    className={`block rounded-lg px-4 py-3 text-[15px] font-bold ${
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
              <button
                type="button"
                className="relative text-[15px]"
                onClick={() => {
                  const contactSection = document.getElementById("contact");
                  contactSection?.scrollIntoView({ behavior: "smooth" });
                  setOpen(false);
                }}
              >
                <span>{t("Contact")}</span>
                <span className="absolute left-0 -bottom-1 block h-[2px] w-full bg-[#00A9DC] rounded-full" />
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    i18n.changeLanguage("fr");
                    setUiLang("fr");
                    setLangOpen(false);
                    setOpen(false);
                    recomputeNameVisibility();
                  }}
                  className={`text-sm ${currentLang === "fr" ? "font-semibold text-[#00A9DC]" : "text-white"}`}
                >
                  {t("Français")}
                </button>

                <button
                  onClick={() => {
                    i18n.changeLanguage("en");
                    setUiLang("en");
                    setLangOpen(false);
                    setOpen(false);
                    recomputeNameVisibility();
                  }}
                  className={`text-sm ${currentLang === "en" ? "font-semibold text-[#00A9DC]" : "text-white"}`}
                >
                  {t("Anglais")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* espace sous le header fixed */} 
      <div className="h-16 md:h-20 lg:h-24" />
    </>
  );
};

export default Navbar;
