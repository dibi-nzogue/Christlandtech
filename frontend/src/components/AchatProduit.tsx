// src/components/AchatProduit.tsx
import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { MdOutlineWhatsapp } from "react-icons/md";
import iphone15Black from "../assets/images/achat/b376285d-d10e-4d67-bee9-85d8efc11186.jfif";
import logo from "../assets/images/logo.jpg";
import { useTranslation } from "react-i18next";
import ordi from "../assets/images/achat/779c4768-1ab0-4692-92a5-718c01baf4f8.jfif";
import cana from "../assets/images/achat/0cbf9c9c-7cfd-4c3d-ae29-e2b2b0471cfe.jfif";

const ACCENT = "bg-[#00A8E8] text-white border-[#00A8E8]";
const ACCENT_HOVER = "hover:opacity-90";

// WhatsApp (format international SANS +)
const WHATSAPP_DEFAULT_PHONE = "237698521478";

const AchatProduit: React.FC = () => {
  const [typeDemande, setTypeDemande] = React.useState("Devis");
  const [qte, setQte] = React.useState("");
  const [nom, setNom] = React.useState("");
  const [tel, setTel] = React.useState("");
  const [okContact, setOkContact] = React.useState(true);
 
  const produit = {
    nom: "Iphone 14 pro",
    ref: "SKU - 123",
    image: iphone15Black,
  };

  /* --- Promo (slide vertical) --- */
  const PROMOS = [
    cana,
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1060&auto=format&fit=crop",
    ordi,
  ];
  const [promoIndex, setPromoIndex] = React.useState(0);
  const nextPromo = () => setPromoIndex((i) => (i + 1) % PROMOS.length);
  const translatePct = (promoIndex / PROMOS.length) * 100;
  const itemHeightPct = 100 / PROMOS.length;

  /* --- WhatsApp --- */
  const ensureRecipientPhone = (): string | null => {
    const p = WHATSAPP_DEFAULT_PHONE.replace(/\D/g, "");
    if (p.length < 7 || p.length > 15) {
      alert("Numéro invalide. Utilisez le format international, sans + ni espaces.");
      return null;
    }
    return p;
  };

  


  const handleWhatsApp = () => {
    if (!okContact) {
      alert("Veuillez accepter d'être contacté pour continuer.");
      return;
    }
    const recipient = ensureRecipientPhone();
    if (!recipient) return;

    const msg = encodeURIComponent(
      `Bonjour, je suis intéressé par le produit: ${produit.nom} (${produit.ref})
Type de demande: ${typeDemande}
Quantité: ${qte || "—"}
Nom & Prénom: ${nom || "—"}
Téléphone: ${tel || "—"}
OK contact: ${okContact ? "Oui" : "Non"}`
    );

    window.open(`https://wa.me/${recipient}?text=${msg}`, "_blank");
  };
const { t } = useTranslation();

// durée entre 2 slides
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
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
}, []);

React.useEffect(() => {
  startAuto();
  return stopAuto; // cleanup
}, [startAuto, stopAuto]);

// pause si l’onglet n’est plus visible, reprise au retour
React.useEffect(() => {
  const onVis = () => (document.hidden ? stopAuto() : startAuto());
  document.addEventListener("visibilitychange", onVis);
  return () => document.removeEventListener("visibilitychange", onVis);
}, [startAuto, stopAuto]);


  return (
    <section className="w-full">
      {/* conteneur global élargi */}
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* 1 colonne en mobile, 2 colonnes dès lg */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6 lg:gap-8">
          {/* ---- CARTE PROMO ---- */}
          <article className="relative md:self-center">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-black h-[360px] sm:h-[380px] md:h-[420px] lg:h-[460px]"
            onMouseEnter={stopAuto}
            onMouseLeave={startAuto}>
              <div
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{
                  height: `${PROMOS.length * 100}%`,
                  transform: `translateY(-${translatePct}%)`,
                }}
              >
                {PROMOS.map((src, i) => (
                  <div key={i} className="w-full" style={{ height: `${itemHeightPct}%` }}>
                    <img src={src} alt={`Promo ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
               <div className="relative h-full flex flex-col justify-between p-5 sm:p-6 text-white">
                <div className="space-y-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                  <h3 className="font-extrabold leading-tight tracking-wide text-[17px] sm:text-[18px]">
                     {t('com.ex')}
                    <br /> 
                  </h3>
                  <div className="text-3xl font-semibold opacity-90 pt-20">8:54</div>
                  <p className="lg:max-w-[40ch] md:max-w-[50ch] sm:max-w-[50ch] text-[11px] sm:text-[12px] lg:text-[15px]  md:text-[15px] leading-relaxed opacity-90 pt-4">
                   {t('com.do')}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={nextPromo}
                    className="group inline-flex items-center gap-3 text-sm font-semibold"
                  >
                    <span className="tracking-wide">{t('com.vo')}</span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-black ring-2 ring-white/70 shadow-sm transition-transform duration-200 group-hover:translate-x-0.5">
                      <FiChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* ---- CARTE ACHAT ---- */}
          <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl
                 min-h-[780px]  sm:min-h-[800px] md:min-h-[800px] lg:min-h-[900px]
                 pb-8 sm:pb-10 " style={{ marginBottom: "env(safe-area-inset-bottom)" }}>


            {/* léger anneau */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 pointer-events-none" />

            {/* Bandeau supérieur + formulaire ensemble dans la grille */}
            <div className="px-5 sm:px-7 md:px-8 pt-7 md:pt-8">
              {/* élargis la colonne image sans agrandir l'image */}
              <div className="grid grid-cols-1
                sm:grid-cols-[220px_minmax(0,1fr)]
                md:grid-cols-[260px_minmax(0,1fr)]
                lg:grid-cols-[320px_minmax(0,1fr)]
                xl:grid-cols-[360px_minmax(0,1fr)]
                2xl:grid-cols-[420px_minmax(0,1fr)]
                gap-6 md:gap-8 items-start">
                {/* GAUCHE : image + infos */}
                <div className="flex flex-col">
                  {/* zone visuelle large, image centrée (image taille fixe) */}
                 <div
                    className="w-full overflow-hidden rounded-xl border border-sky-100 flex justify-center items-center"
                  >
                     <img
      src={produit.image}
      alt={produit.nom}
      className="w-full h-auto object-cover rounded-xl
                 max-h-[220px] sm:max-h-[240px] md:max-h-[260px]
                 lg:max-h-[300px] xl:max-h-[340px]"
    />
                  </div>




                  <div className="mt-3 leading-tight pt-4">
                    <h3 className="text-[18px] md:text-[20px] font-semibold text-gray-900">
                      {produit.nom}
                    </h3>
                    <p className="text-[12px] md:text-[13px] text-gray-500 pt-3"> {t('com.ref')}{produit.ref}</p>
                  </div>
                </div>

                {/* DROITE : titre + bouton + FORM (plus de grand vide) */}
                            <div className="relative flex flex-col gap-3 md:gap-4 sm:pl-4 md:pl-6">
              {/* Watermark logo (décoratif) */}
              <img
                src={logo}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none select-none absolute right-2 md:right-6 top-24 md:top-28 w-[240px] sm:w-[300px] md:w-[340px] lg:w-[640px] opacity-30 "/>
               
               <div className="relative z-10 pt-4">
                  <h2 className="text-[18px] md:text-[22px] font-extrabold tracking-wide text-gray-900 text-center mb-8">
                    {t('com.ach')}
                  </h2>

                  <button
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                   className={`w-full sm:max-w-[520px] md:max-w-[560px] mx-auto inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-[15px] font-semibold ${ACCENT} ${ACCENT_HOVER}`}>
                    {t('com.nom')} : iPhone 14
                  </button>

                  {/* ====== FORM ICI ====== */}
                  <form
                   className="mt-2 px-4 sm:px-0"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleWhatsApp();
                    }}
                  >
                    <div  className="grid gap-6 sm:gap-8 md:gap-10 w-full max-w-[620px] mx-auto pt-9 md:pt-10 pb-8">

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          {t('com.nom')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={typeDemande}
                          onChange={(e) => setTypeDemande(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/30"
                        >
                          <option>{t('com.ref')}</option>
                          <option>{t('com.ac')}</option>
                          <option>{t('com.in')}</option>
                          <option>{t('com.di')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                         {t('com.quc')} <span className="text-red-500">*</span>
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
                         {t('com.np')} <span className="text-red-500">*</span>
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

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                           {t('com.tel')}<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="Ex: 698521478"
                          value={tel}
                          onChange={(e) => setTel(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:border-[#00A8E8] focus:ring-2 focus:ring-[#00A8E8]/30"
                          required
                        />
                      </div>

                      <label className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700 select-none">
                        <input
                          type="checkbox"
                          checked={okContact}
                          onChange={(e) => setOkContact(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#00A8E8] focus:ring-[#00A8E8]"
                        />
                         {t('com.a')}
                      </label>

                     <div
                      className="pt-2 px-4 sm:px-0 flex justify-center mt-4 sm:mt-5 mb-6 sm:mb-8"
                      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
                    >

                      <button
                      type="submit"
                      className={`flex w-full max-w-[360px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] mx-auto
                                  items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-[15px] font-semibold
                                  ${ACCENT} ${ACCENT_HOVER}`}
                      >
                        <MdOutlineWhatsapp className="h-5 w-5" />
                        {t('com.sen')}
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
