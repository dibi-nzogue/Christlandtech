// src/components/AchatProduit.tsx
import * as React from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { MdOutlineWhatsapp } from "react-icons/md";
import { FaTelegramPlane } from "react-icons/fa";
import { SiSignal } from "react-icons/si";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
// @ts-ignore : la lib n'a pas de types, on ignore juste l'erreur TS
import { allCountries } from "country-telephone-data";


import {
  useFetchQuery,
  api,
  type ApiProduct,
} from "../hooks/useFetchQuery";

import logo from "../assets/images/logo.jpg";
import ordi from "../assets/images/achat/779c4768-1ab0-4692-92a5-718c01baf4f8.jfif";
import cana from "../assets/images/achat/0cbf9c9c-7cfd-4c3d-ae29-e2b2b0471cfe.jfif";

const ACCENT = "bg-[#00A8E8] text-white border-[#00A8E8]";
const ACCENT_HOVER = "hover:opacity-90";
const WHATSAPP_DEFAULT_PHONE = "+237692548739";
const TELEGRAM_USERNAME = "dibiye2"; // ton compte service client, sans @
const SIGNAL_NUMBER = "+237699281882"; // si tu veux un numéro Signal fixe



const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='16'%3EImage indisponible%3C/text%3E%3C/svg%3E";

type CanalContact = "whatsapp" | "signal" | "telegram";

type CountryOption = {
  code: string; // "CM", "FR", ...
  name: string;
  dial: string; // "+237"
};

// la forme réelle des objets de la lib
type RawCountry = {
  name: string;
  iso2: string;
  dialCode: string;
  // (il y a d'autres champs mais on s'en fiche ici)
};

const COUNTRY_OPTIONS: CountryOption[] = (allCountries as RawCountry[])
  .map((c) => ({
    name: c.name,
    code: c.iso2.toUpperCase(),
    dial: `+${c.dialCode}`,
  }))
  // on filtre au cas où (évite les "+undefined")
  .filter((c) => c.name && c.code && c.dial);


// Type minimal du produit utilisé par le bouton Commander
export type ProduitMini = {
  id: number;
  slug: string;
  nom: string;
  ref?: string;
  image?: string;
};

type Props = {
  produit?: ProduitMini | null;
  productId?: number;
  productSlug?: string;
  refEl?: React.RefObject<HTMLDivElement | null>;
};

const getPrimaryImage = (p?: ApiProduct | null): string | undefined => {
  if (!p?.images?.length) return undefined;
  const primary = p.images.find((im) => im.principale) ?? p.images[0];
  return primary?.url || undefined;
};

const toMini = (p: ApiProduct): ProduitMini => ({
  id: p.id,
  slug: p.slug,
  nom: p.nom,
  ref: p.slug?.toUpperCase(),
  image: getPrimaryImage(p),
});

const AchatProduit: React.FC<Props> = ({
  produit,
  productId,
  productSlug,
  refEl,
}) => {
  const { t } = useTranslation();

  // Décide si on doit fetcher
  const shouldFetch = !produit && (!!productId || !!productSlug);
  const detailPath = React.useMemo(() => {
    if (productId) return `/api/catalog/products/${productId}/`;
    if (productSlug)
      return `/api/catalog/products/${encodeURIComponent(productSlug)}/`;
    return "";
  }, [productId, productSlug]);

  // Chargement du produit
  const {
    data: fetched,
    loading: loadingProduct,
    error: productError,
  } = useFetchQuery<ApiProduct>(api(detailPath), {
    enabled: shouldFetch && !!detailPath,
    keepPreviousData: false,
  });

  const mini: ProduitMini | null = React.useMemo(() => {
    if (produit) return produit;
    if (fetched) return toMini(fetched);
    return null;
  }, [produit, fetched]);

  // ------- État formulaire -------
  const [typeDemande, setTypeDemande] = React.useState("Devis");
  const [qte, setQte] = React.useState("");
  const [nom, setNom] = React.useState("");

  // téléphone : pays + numéro local
  const [country, setCountry] = React.useState<CountryOption>(
    COUNTRY_OPTIONS.find((c) => c.code === "CM") || COUNTRY_OPTIONS[0]
  );
  const [countryOpen, setCountryOpen] = React.useState(false);
  const [countrySearch, setCountrySearch] = React.useState("");
  const [telLocal, setTelLocal] = React.useState("");

  const [canal, setCanal] = React.useState<CanalContact>("whatsapp");
  const [submitting, setSubmitting] = React.useState(false);


  const filteredCountries = React.useMemo(() => {
    const term = countrySearch.trim().toLowerCase();
    if (!term) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.dial.replace("+", "").includes(term)
    );
  }, [countrySearch]);

  // ------- Promo (slide vertical auto) -------
  const PROMOS = React.useMemo(
    () => [
      cana,
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1060&auto=format&fit=crop",
      ordi,
    ],
    []
  );
  const [promoIndex, setPromoIndex] = React.useState(0);
  const AUTO_MS = 3500;
  const timerRef = React.useRef<number | null>(null);

  const startAuto = React.useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setPromoIndex((i) => (i + 1) % PROMOS.length);
    }, AUTO_MS);
  }, [PROMOS.length]);

  const stopAuto = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  React.useEffect(() => {
    const onVis = () => (document.hidden ? stopAuto() : startAuto());
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [startAuto, stopAuto]);

  // ------- Messageries externes -------
  const ensureRecipientPhone = (): string | null => {
    const p = WHATSAPP_DEFAULT_PHONE.replace(/\D/g, "");
    if (p.length < 7 || p.length > 15) {
      alert(
        "Numéro WhatsApp invalide. Utilisez le format international, sans + ni espaces."
      );
      return null;
    }
    return p;
  };

const openChatChannel = (channel: CanalContact, fullMsg: string) => {
  const encoded = encodeURIComponent(fullMsg);

  if (channel === "whatsapp") {
    const recipient = ensureRecipientPhone();
    if (!recipient) return;
    window.open(`https://wa.me/${recipient}?text=${encoded}`, "_blank");
    return;
  }

  if (channel === "telegram") {
    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encoded}`, "_blank");
    return;
  }

  if (channel === "signal") {
    const openSignal = () => {
      window.open(`https://signal.me/#p/${SIGNAL_NUMBER}`, "_blank");
    };

    // On essaie de copier le message dans le presse-papier
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(fullMsg)
        .then(() => {
          openSignal();
          alert(
            "Signal va s'ouvrir.\nLe message a été copié, il vous suffit de le coller dans la conversation et de l'envoyer."
          );
        })
        .catch(() => {
          // Si la copie échoue, on affiche le texte à copier manuellement
          window.prompt(
            "Copiez ce message puis collez-le dans Signal :",
            fullMsg
          );
          openSignal();
        });
    } else {
      // Contexte non sécurisé (http, localhost, ancien navigateur) → copie manuelle
      window.prompt(
        "Copiez ce message puis collez-le dans Signal :",
        fullMsg
      );
      openSignal();
    }

    return;
  }

};



  const baseBtnClasses =
    "flex w-full max-w-[360px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] mx-auto items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  const channelBtnClasses: Record<CanalContact, string> = {
    whatsapp: "bg-[#25D366] hover:bg-[#1ebe57] text-white border-[#25D366]",
    signal: "bg-[#3a76f0] hover:bg-[#275ccd] text-white border-[#3a76f0]",
    telegram: "bg-[#229ED9] hover:bg-[#1b86b8] text-white border-[#229ED9]",
  };

  const renderSubmitIcon = () => {
    if (submitting) return null;
    switch (canal) {
      case "whatsapp":
        return <MdOutlineWhatsapp className="h-5 w-5" />;
      case "signal":
        return <SiSignal className="h-5 w-5" />;
      case "telegram":
        return <FaTelegramPlane className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const renderSubmitLabel = () => {
    if (submitting) {
      return t("form.sending") || "Envoi…";
    }
    switch (canal) {
      case "whatsapp":
        return t("form.button.whatsapp") || "Envoyer via WhatsApp";
      case "signal":
        return t("form.button.signal") || "Ouvrir Signal";
      case "telegram":
        return t("form.button.telegram") || "Envoyer via Telegram";
      default:
        return t("com.sen") || "Envoyer";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mini) return;
    if (!qte.trim() || !nom.trim() || !telLocal.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

  
    const fullMsg = `Bonjour, je suis intéressé par le produit : ${mini.nom} (${mini.ref ?? "—"})
    Type de demande : ${typeDemande}
    Quantité : ${qte || "—"}
    Nom & Prénom : ${nom || "—"}`;
    setSubmitting(true);
    try {
      openChatChannel(canal, fullMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- États intermédiaires ----
  if (shouldFetch && loadingProduct) {
    return (
      <section ref={refEl} className="w-full">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 text-center text-gray-600">
          Chargement du produit…
        </div>
      </section>
    );
  }

  if (shouldFetch && productError) {
    return (
      <section ref={refEl} className="w-full">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 text-center text-red-600">
          Impossible de charger le produit.
        </div>
      </section>
    );
  }

  if (!mini) {
    return <section ref={refEl} className="w-full" />;
  }

  const translatePct = (promoIndex / PROMOS.length) * 100;
  const itemHeightPct = 100 / PROMOS.length;
  const imgSrc = mini.image || FALLBACK_IMG;

  return (
    <section ref={refEl} className="w-full">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6 lg:gap-8">
          {/* ---- CARTE PROMO ---- */}
          <article className="relative md:self-center">
            <div
              className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-black h-[360px] sm:h-[380px] md:h-[420px] lg:h-[460px]"
              onMouseEnter={stopAuto}
              onMouseLeave={startAuto}
            >
              <div
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{
                  height: `${PROMOS.length * 100}%`,
                  transform: `translateY(-${translatePct}%)`,
                }}
              >
                {PROMOS.map((src, i) => (
                  <div
                    key={i}
                    className="w-full"
                    style={{ height: `${itemHeightPct}%` }}
                  >
                    <img
                      src={src}
                      alt={`Promo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
              <div className="relative h-full flex flex-col justify-between p-5 sm:p-6 text-white">
                <div className="space-y-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                  <h3 className="font-extrabold leading-tight tracking-wide text-[17px] sm:text-[18px]">
                    {t("com.ex")}
                    <br />
                  </h3>
                  <div className="text-3xl font-semibold opacity-90 pt-20">
                    8:54
                  </div>
                  <p className="lg:max-w-[40ch] md:max-w-[50ch] sm:max-w-[50ch] text-[11px] sm:text-[12px] lg:text-[15px] md:text-[15px] leading-relaxed opacity-90 pt-4">
                    {t("com.do")}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setPromoIndex((i) => (i + 1) % PROMOS.length)
                    }
                    className="group inline-flex items-center gap-3 text-sm font-semibold"
                  >
                    <span className="tracking-wide">{t("com.vo")}</span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-black ring-2 ring-white/70 shadow-sm transition-transform duration-200 group-hover:translate-x-0.5">
                      <FiChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* ---- CARTE ACHAT ---- */}
          <article
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl
                 min-h-[780px] sm:min-h-[800px] md:min-h-[800px] lg:min-h-[900px]
                 pb-8 sm:pb-10"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 pointer-events-none" />
            <div className="px-5 sm:px-7 md:px-8 pt-7 md:pt-8">
              <div
                className="grid grid-cols-1
                sm:grid-cols-[220px_minmax(0,1fr)]
                md:grid-cols-[260px_minmax(0,1fr)]
                lg:grid-cols-[320px_minmax(0,1fr)]
                xl:grid-cols-[360px_minmax(0,1fr)]
                2xl:grid-cols-[420px_minmax(0,1fr)]
                gap-6 md:gap-8 items-start"
              >
                {/* GAUCHE : image + infos */}
                <div className="flex flex-col">
                  <div className="relative w-full overflow-hidden rounded-xl bg-transparent">
                    <div className="pt-[100%] sm:pt-[75%] lg:pt-[56.25%]" />

                    <img
                      src={imgSrc}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover scale-110 blur-md opacity-40"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />

                    <img
                      src={imgSrc}
                      alt={mini.nom}
                      className="absolute inset-0 h-full w-full object-contain p-2 md:p-3 drop-shadow-sm"
                      onError={(e) => {
                        (
                          e.currentTarget as HTMLImageElement
                        ).src = FALLBACK_IMG;
                      }}
                    />

                    <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 rounded-xl" />
                  </div>

                  <div className="mt-3 leading-tight pt-4">
                    <h3 className="text-[18px] md:text-[20px] font-semibold text-gray-900">
                      {mini.nom}
                    </h3>
                    <p className="text-[12px] md:text-[13px] text-gray-500 pt-3">
                      {t("com.ref")}
                      {mini.ref}
                    </p>
                  </div>
                </div>

                {/* DROITE : titre + bouton + FORM */}
                <div className="relative flex flex-col gap-3 md:gap-4 sm:pl-4 md:pl-6">
                  <img
                    src={logo}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="pointer-events-none select-none absolute right-2 md:right-6 top-24 md:top-28 w-[240px] sm:w-[300px] md:w-[340px] lg:w-[640px] opacity-30 "
                  />

                  <div className="relative z-10 pt-4">
                    <h2 className="text-[18px] md:text-[22px] font-extrabold tracking-wide text-gray-900 text-center mb-8">
                      {t("com.ach")}
                    </h2>

                    <button
                      type="button"
                      aria-disabled="true"
                      tabIndex={-1}
                      className={`w-full sm:max-w-[520px] md:max-w-[560px] mx-auto inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-[15px] font-semibold ${ACCENT} ${ACCENT_HOVER}`}
                    >
                      {t("com.nom")} : {mini.nom}
                    </button>

                    {/* ====== FORM ====== */}
                    <form className="mt-2 px-4 sm:px-0" onSubmit={handleSubmit}>
                      <div className="grid gap-6 sm:gap-8 md:gap-10 w-full max-w-[620px] mx-auto pt-9 md:pt-10 pb-8">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            {t("com.type")}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={typeDemande}
                            onChange={(e) => setTypeDemande(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/30"
                          >
                            <option>{t("com.qo")}</option>
                            <option>{t("com.ac")}</option>
                            <option>{t("com.in")}</option>
                            <option>{t("com.di")}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            {t("com.quc")}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            placeholder="Ex: 3"
                            value={qte}
                            onChange={(e) => setQte(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/30"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            {t("com.np")}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Nzogue Rachel"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/30"
                            required
                          />
                        </div>

                        {/* TÉLÉPHONE : champ custom avec drapeau + indicatif + numéro */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            {t("com.tel")}{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="relative">
                            {/* Ligne principale (drapeau + indicatif + input) */}
                            <div className="flex rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-[#00A8E8]/30 focus-within:border-[#00A8E8]">
                              {/* Bouton drapeau + indicatif */}
                              <button
                                type="button"
                                onClick={() =>
                                  setCountryOpen((open) => !open)
                                }
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border-r border-gray-200"
                              >
                                <ReactCountryFlag
                                  svg
                                  countryCode={country.code}
                                  className="h-4 w-6 rounded-sm shadow-sm"
                                />
                                <span className="font-medium text-gray-800">
                                  {country.dial}
                                </span>
                                <FiChevronDown className="h-3 w-3 text-gray-500" />
                              </button>

                              {/* Input numéro local */}
                              <input
                                type="tel"
                                value={telLocal}
                                onChange={(e) => setTelLocal(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                                placeholder="Ex : 699 99 99 99"
                                required
                              />
                            </div>

                            {/* Dropdown pays */}
                            {countryOpen && (
                              <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                                {/* champ recherche */}
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                                  <input
                                    type="text"
                                    value={countrySearch}
                                    onChange={(e) =>
                                      setCountrySearch(e.target.value)
                                    }
                                    placeholder="Search"
                                    className="w-full text-sm bg-transparent outline-none"
                                  />
                                </div>

                                {/* liste pays */}
                                <ul className="max-h-64 overflow-y-auto text-sm">
                                  {filteredCountries.map((c) => (
                                    <li key={c.code}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCountry(c);
                                          setCountryOpen(false);
                                          setCountrySearch("");
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-left"
                                      >
                                        <ReactCountryFlag
                                          svg
                                          countryCode={c.code}
                                          className="h-4 w-6 rounded-sm shadow-sm"
                                        />
                                        <span className="flex-1 truncate">
                                          {c.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {c.dial}
                                        </span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Choix du canal */}
                        <div>
                          <span className="block text-gray-700 mb-2 text-sm">
                            {t("contact.channel.label") ||
                              "Canal de contact préféré"}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              {
                                key: "whatsapp",
                                label:
                                  t("contact.channel.whatsapp") || "WhatsApp",
                              },
                              {
                                key: "signal",
                                label: t("contact.channel.signal") || "Signal",
                              },
                              {
                                key: "telegram",
                                label:
                                  t("contact.channel.telegram") || "Telegram",
                              },
                            ].map((opt) => {
                              const active =
                                canal === (opt.key as CanalContact);
                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() =>
                                    setCanal(opt.key as CanalContact)
                                  }
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition
                                  ${
                                    active
                                      ? "bg-[#00A8E8] text-white border-[#00A8E8]"
                                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div
                          className="pt-2 px-4 sm:px-0 flex justify-center mt-4 sm:mt-5 mb-6 sm:mb-8"
                          style={{
                            marginBottom: "env(safe-area-inset-bottom)",
                          }}
                        >
                          <button
                            type="submit"
                            disabled={submitting}
                            className={`${baseBtnClasses} ${channelBtnClasses[canal]}`}
                          >
                            {renderSubmitIcon()}
                            <span>{renderSubmitLabel()}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                    {/* ====== /FORM ====== */}
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-2xl bg-gradient-to-t from-black/5 to-transparent" />
          </article>
        </div>
      </div>
    </section>
  );
};

export default AchatProduit;
