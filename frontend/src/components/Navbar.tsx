import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { FaSearch, FaGlobe, FaChevronDown } from "react-icons/fa";
import logo from "../assets/images/logo.webp";
import { useTranslation } from "react-i18next";
import { setUiLang } from "../i18nLang";

type LinkItem = { label: string; to: string };

const PhoneBadge: React.FC<{ compact?: boolean; className?: string }> = ({
  compact,
  className = "",
}) => {
  return (
    <a
      href="tel:+237691554641"
      className={`
        inline-flex items-center font-extrabold text-white/95 hover:text-white transition
        whitespace-nowrap
        ${
          compact
            ? "text-[11px] sm:text-[12px] md:text-[13px]"
            : "text-[18px] xl:text-[22px]"
        }
        ${className}
      `}
      aria-label="Appeler +237 691554641"
      title="+237 691554641 / 676089671"
    >
      <span>+237 691554641</span>
      <span className="mx-1 text-white/40">/</span>
      <span>676089671</span>
    </a>
  );
};

const LINKS: LinkItem[] = [
  { label: "Accueil", to: "/" },
  { label: "A propos", to: "/a-propos" },
  { label: "Produits", to: "/produits" },
  { label: "Services", to: "/services" },
  { label: "Assistance", to: "/assistance" },
];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const [showName, setShowName] = useState(true);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);

  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();

  const [q, setQ] = useState("");

  useEffect(() => {
    if (pathname.startsWith("/produits")) {
      setQ((urlSearchParams.get("q") || "").trim());
    } else {
      setQ("");
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

  const isActive = (to: string) =>
    pathname === to || (to !== "/" && pathname.startsWith(to));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    document.documentElement.lang = i18n.language?.startsWith("en")
      ? "en"
      : "fr";
  }, [i18n.language]);

  const recomputeNameVisibility = () => {
    const el = nameRef.current;
    if (!el) return;
    const willTruncate = el.scrollWidth > el.clientWidth;
    setShowName(!willTruncate);
  };

  useEffect(() => {
    recomputeNameVisibility();
  }, []);

  useEffect(() => {
    recomputeNameVisibility();
  }, [i18n.language]);

  useEffect(() => {
    if (!linkRef.current) return;

    const ro = new ResizeObserver(() => recomputeNameVisibility());
    ro.observe(linkRef.current);
    if (nameRef.current) ro.observe(nameRef.current);

    const onR = () => recomputeNameVisibility();
    window.addEventListener("resize", onR);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onR);
    };
  }, []);

  const currentLang = i18n.language;

  const [phoneDrop, setPhoneDrop] = useState(false);
  useEffect(() => {
    setPhoneDrop(true);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-black text-white shadow-md lg:pt-5">
        <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-6 lg:px-10">
          {/* Ligne principale */}
          <div
            className="
              grid items-center
              gap-x-3 gap-y-2
              h-16 lg:h-24
              grid-cols-[auto_1fr_auto]
              lg:grid-cols-[auto_1fr_auto_auto]
            "
          >
            {/* Logo + nom */}
            <Link
              ref={linkRef}
              to="/"
              className="flex items-center gap-2 lg:gap-4 flex-shrink-0 min-w-0"
              aria-label="CHRISTLAND TECH"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 lg:h-16 lg:w-16 rounded-full bg-white overflow-hidden flex-shrink-0">
                <img
                  src={logo}
                  alt=""
                  loading="lazy"
                  width={300}
                  height={300}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {showName ? (
                <div
                  ref={nameRef}
                  className="
                    leading-tight text-white font-semibold whitespace-nowrap
                    overflow-hidden
                    max-w-[52vw] lg:max-w-none
                  "
                >
                  <span className="text-[12px] sm:text-[13px] lg:text-[17px] tracking-wide">
                    CHRISTLAND
                  </span>{" "}
                  <span className="text-[#00A8E8] text-[12px] sm:text-[13px] lg:text-[17px] font-extrabold">
                    TECH
                  </span>
                </div>
              ) : (
                <span className="sr-only">CHRISTLAND TECH</span>
              )}
            </Link>

            {/* ✅ Desktop only (>= lg) : Recherche */}
            <div className="hidden lg:block lg:row-start-1 lg:col-start-2 min-w-0">
              <div className="relative w-full max-w-[520px] xl:max-w-[620px]">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQ(value);
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
                  className="w-full rounded-full bg-white py-2.5 pl-11 pr-4 text-[15px] text-gray-900 placeholder-gray-500 shadow-[0_10px_28px_rgba(0,0,0,0.10)] focus:outline-none"
                />
              </div>
            </div>

            {/* ✅ Desktop only (>= lg) : Téléphones */}
            <div className="hidden lg:flex justify-self-end">
              <PhoneBadge className={phoneDrop ? "phone-drop" : ""} />
            </div>

            {/* ✅ Desktop only (>= lg) : Contact + Langue */}
            <div className="hidden lg:flex items-center justify-end gap-4">
              <button
                type="button"
                className="relative text-[15px] cursor-pointer"
                onClick={() => {
                  const contactSection = document.getElementById("contact");
                  contactSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>{t("Contact")}</span>
                <span className="absolute left-0 -bottom-2 block h-[4px] w-full bg-[#00A9DC]" />
              </button>

              <div className="bg-white/60 py-4 w-px" />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                  aria-label={t("Changer de langue")}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-white"
                >
                  <FaGlobe className="h-5 w-5" />
                  <FaChevronDown className="h-3 w-3" />
                </button>

                {langOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-md bg-white text-gray-900 py-1 shadow-lg ring-1 ring-black/5">
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                        currentLang === "fr" ? "font-semibold text-[#00A9DC]" : ""
                      }`}
                      onClick={() => {
                        i18n.changeLanguage("fr");
                        setUiLang("fr");
                        setLangOpen(false);
                        recomputeNameVisibility();
                      }}
                    >
                      {t("Français")}
                    </button>
                    <button
                      type="button"
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

            {/* ✅ Mobile+Tablet (< lg) : num + icônes */}
            {!open && (
              <div className="lg:hidden ml-auto flex items-center gap-2 min-w-0">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <PhoneBadge compact className={phoneDrop ? "phone-drop" : ""} />
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
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
                    type="button"
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
              </div>
            )}
          </div>

          {/* ✅ Liens desktop seulement (>= lg) */}
          <nav className="hidden lg:flex flex-wrap items-center gap-x-4 gap-y-2 pb-3">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={`px-2 py-2 text-[15px] transition-colors ${
                  isActive(l.to)
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <span className="relative font-bold">
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

        {/* Overlay mobile/tablette */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Panneau mobile/tablette */}
        <div
          className={`fixed top-16 left-0 right-0 z-50 flex justify-center lg:hidden transition-all duration-200 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-[92%] max-w-sm rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden">
            {/* Barre du panneau */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex-shrink-0">
                  <img
                    src={logo}
                    width={300}
                    height={300}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-semibold text-md whitespace-nowrap truncate">
                  CHRISTLAND <span className="text-[#00A9E8]">TECH</span>
                </span>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-200"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Recherche mobile */}
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
                    type="button"
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
                      type="button"
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

            {/* Liens mobile/tablette */}
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

            {/* Contact + langue mobile/tablette */}
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
                  type="button"
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
                  type="button"
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

      <style>{`
        @keyframes phoneDrop {
          0%   { transform: translateY(-18px); opacity: 0; }
          65%  { transform: translateY(4px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .phone-drop {
          animation: phoneDrop 650ms cubic-bezier(.2,.9,.2,1) both;
        }
      `}</style>

      {/* espace sous le header fixed */}
      <div className="h-16 lg:h-24" />
    </>
  );
};

export default Navbar;
