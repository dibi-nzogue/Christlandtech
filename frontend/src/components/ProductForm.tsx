// src/components/ProductForm.tsx
import React, { useMemo, useState } from "react";
import {
  createProductWithVariant,
  useFilters, 
  useCategories,
  useMarques,
  useCouleurs,
  uploadProductImage,
  
  type ProductPayload,
} from "../hooks/useFetchQuery";
import ComboCreate, { type ComboOption } from "./ComboCreate";
import DateTimePicker, { parseLocalDateTime } from "./DateTimePicker";
import MultiComboCreate from "./MultiComboCreate";

type ProduitFormState = {
  nom: string;
  slug: string;
  description_courte: string;
  description_long: string;
  garantie_mois: number | null;
  poids_grammes: number | null;

  dimensions: string;
 etat: "neuf" | "occasion" | "reconditionné";
  categorie: string;
  marque: string;
  marque_libre: string;
  est_actif: boolean;
  visible: 0 | 1 | null;

  // Variante
  variante_nom: string;
  sku: string;
  code_barres: string;
  prix: number | null;
  prix_promo: number | null;
  promo_active: boolean;
  promo_debut: string;         // HTML datetime-local
  promo_fin: string;           // HTML datetime-local
  stock: number | null;

  prix_achat: number | null;
  variante_poids_grammes: number | null;
  variante_est_actif: boolean;

  // Couleur
  couleur: string;
  couleur_libre: string;
};

type ImgRow = {
  url: string;
  alt_text?: string;
  position?: number | null;
  principale?: boolean;
  _localFile?: File | null;
  _uploading?: boolean;
  _error?: string | null;
};

const Toast: React.FC<{ kind: "success" | "error"; msg: string; onClose(): void }> = ({
  kind, msg, onClose,
}) => (
  <div className={`fixed top-4 right-4 z-[9999] rounded-xl shadow-lg px-4 py-3 text-white ${kind === "success" ? "bg-emerald-600" : "bg-rose-600"}`} role="status">
    <div className="flex items-start gap-3">
      <span className="font-semibold">{kind === "success" ? "Succès" : "Erreur"}</span>
      <span className="opacity-90">{msg}</span>
      <button type="button" onClick={onClose} className="ml-3 text-white/90 hover:text-white" aria-label="Fermer">×</button>
    </div>
  </div>
);

const ProductForm: React.FC = () => {
  const { data: categories } = useCategories();
  const { data: marques } = useMarques();
  const { data: couleurs } = useCouleurs();

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  const [formData, setFormData] = useState<ProduitFormState>({
    nom: "",
    slug: "",
    description_courte: "",
    description_long: "",
    garantie_mois: null,
    poids_grammes: null,
    dimensions: "",
    etat: "neuf",
    categorie: "",
    marque: "",
    marque_libre: "",
    est_actif: true,
    visible: 1,

    variante_nom: "",
    sku: "",
    code_barres: "",
    prix: null,
    prix_promo: null,
    promo_active: false,
    promo_debut: "",
    promo_fin: "",
    stock: null,

    prix_achat: null,
    variante_poids_grammes: null,
    variante_est_actif: true,

    couleur: "",
    couleur_libre: "",
  });

  // === IMAGES ===
  const [images, setImages] = useState<ImgRow[]>([
    { url: "", alt_text: "", position: 1, principale: true, _localFile: null, _uploading: false, _error: null },
    
  ]);
// Attributs dynamiques saisis
const [prodAttrs, setProdAttrs] = useState<Record<string, any>>({});
const [varAttrs, setVarAttrs] = useState<Record<string, any>>({});
  const addImage = () =>
    setImages((arr) => [
      ...arr,
      {
        url: "",
        alt_text: "",
        position: (arr[arr.length - 1]?.position ?? arr.length) + 1,
        principale: false,
        _localFile: null,
        _uploading: false,
        _error: null,
      },
    ]);

  const removeImage = (idx: number) =>
    setImages((arr) => (arr.length <= 1 ? arr : arr.filter((_, i) => i !== idx)));

  const updateImage = (idx: number, patch: Partial<ImgRow>) =>
    setImages((arr) => arr.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const setPrincipale = (idx: number) =>
    setImages((arr) => arr.map((r, i) => ({ ...r, principale: i === idx })));

  // fichier -> upload -> url
  const onSelectFile = async (idx: number, file: File | null) => {
    if (!file) {
      updateImage(idx, { _localFile: null, _error: null });
      return;
    }
    updateImage(idx, { _localFile: file, _uploading: true, _error: null });
    try {
      const { url } = await uploadProductImage(file);
      updateImage(idx, { url, _uploading: false, _error: null });
      setImages((arr) => {
        const hasMain = arr.some((a) => a.principale);
        if (!hasMain) return arr.map((a, i) => (i === idx ? { ...a, principale: true } : a));
        return arr;
      });
    } catch (e: any) {
      updateImage(idx, { _uploading: false, _error: e?.message || "Upload échoué" });
      setToast({ kind: "error", msg: e?.message || "Échec de l’upload de l’image." });
    }
  };

  // options
  const toOptions = (rows: any[] | null | undefined): ComboOption[] =>
    (rows ?? []).map((r: any) => ({ id: r.id ?? r.slug ?? r.nom, label: r.nom ?? r.slug ?? String(r) }));
  const categoryOptions = toOptions(categories);


// Slug réel de la catégorie choisie (pour /filters/)
const selectedCategorySlug = useMemo(() => {
  if (!formData.categorie || !Array.isArray(categories)) return "";
  const row = categories.find((c: any) => String(c.id) === String(formData.categorie));
  return row?.slug ?? "";
}, [formData.categorie, categories]);

// Charge les filtres dont les "attributes" pour la catégorie
// Charge les filtres + sépare Produit / Variante
const { data: filters } = useFilters({
  category: selectedCategorySlug || undefined,
  subcategory: undefined,
});

const attrsProduct = filters?.attributes_product
  ?? (filters?.attributes ?? []).filter(a => a); // fallback si backend pas encore à jour
const attrsVariant = filters?.attributes_variant
  ?? (filters?.attributes ?? []).filter(a => a); // fallback

// Valeurs "créées" par l'utilisateur pour les attributs choice, par code
const [customAttrChoices, setCustomAttrChoices] = useState<Record<string, string[]>>({});




  const brandOptions = toOptions(marques);
  const colorOptions = toOptions(couleurs);

  // valeurs
  const categoryValue = categoryOptions.find((o) => String(o.id) === String(formData.categorie)) ?? null;
  const brandValue =
    formData.marque === "__custom__"
      ? formData.marque_libre
        ? { id: "__custom__", label: formData.marque_libre }
        : null
      : brandOptions.find((o) => String(o.id) === String(formData.marque)) ?? null;
  const colorValue =
    formData.couleur === "__custom__"
      ? formData.couleur_libre
        ? { id: "__custom__", label: formData.couleur_libre }
        : null
      : colorOptions.find((o) => String(o.id) === String(formData.couleur)) ?? null;

  // handlers combos
const onCategoryChange = (opt: ComboOption | null) => {
  if (!opt) return setFormData((p) => ({ ...p, categorie: "" }));
  setFormData((p) => ({ ...p, categorie: String(opt.id ?? "") }));
  setProdAttrs({});
  setVarAttrs({});
  setCustomAttrChoices({}); // <-- reset des propositions custom
};

  const onBrandChange = (opt: ComboOption | null) => {
    if (!opt) return setFormData((p) => ({ ...p, marque: "", marque_libre: "" }));
    if (brandOptions.some((o) => String(o.id) === String(opt.id))) {
      setFormData((p) => ({ ...p, marque: String(opt.id ?? ""), marque_libre: "" }));
    } else {
      setFormData((p) => ({ ...p, marque: "__custom__", marque_libre: opt.label }));
    }
  };
  const onColorChange = (opt: ComboOption | null) => {
    if (!opt) return setFormData((p) => ({ ...p, couleur: "", couleur_libre: "" }));
    if (colorOptions.some((o) => String(o.id) === String(opt.id))) {
      setFormData((p) => ({ ...p, couleur: String(opt.id ?? ""), couleur_libre: "" }));
    } else {
      setFormData((p) => ({ ...p, couleur: "__custom__", couleur_libre: opt.label }));
    }
  };

  // commun
  const numericKeys = new Set([
    "garantie_mois",
    "poids_grammes",

    "prix",
    "prix_promo",
    "stock",
    "prix_achat",
    "variante_poids_grammes",
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const t = e.currentTarget;
    if (t instanceof HTMLInputElement && t.type === "checkbox") {
      setFormData((p) => ({ ...p, [t.name]: t.checked }));
      return;
    }
    if (t.name === "visible") {
      const v = t.value === "" ? null : (Number(t.value) as 0 | 1);
      setFormData((p) => ({ ...p, visible: v }));
      return;
    }
    let val: any = t.value;
    if (numericKeys.has(t.name)) val = val === "" ? null : Number(val);
    setFormData((p) => ({ ...p, [t.name]: val }));
  };

  // validations
  const validateRequired = (): string | null => {
    if (!formData.nom.trim()) return "Le nom du produit est requis.";
    if (formData.visible !== 0 && formData.visible !== 1) return "Visible doit être 1 (oui) ou 0 (non).";
    if (formData.prix == null) return "Le prix de la variante est requis.";
    const hasMarque = !!formData.marque || !!formData.marque_libre.trim();
    if (!hasMarque) return "La marque est requise.";
    if (!formData.categorie) return "La catégorie est requise.";
    const valid = images.filter((i) => i.url && i.url.trim() !== "");
    if (valid.length === 0) return "Au moins une image est requise.";
    if (!valid.some((i) => i.principale)) return "Choisis une image principale.";
    if (images.some((i) => i._uploading)) return "Patiente, une image est encore en cours d’upload.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateRequired();
    if (err) return setToast({ kind: "error", msg: err });

    const marqueValue = formData.marque === "__custom__" ? formData.marque_libre.trim() || null : formData.marque || null;
    const couleurValue = formData.couleur === "__custom__" ? formData.couleur_libre.trim() || null : formData.couleur || null;

    const imagesPayload = images
      .filter((i) => (i.url || "").trim() !== "")
      .map((i) => ({
        url: i.url.trim(),
        alt_text: (i.alt_text || "").trim(),
        position: i.position == null || Number.isNaN(Number(i.position)) ? null : Number(i.position),
        principale: !!i.principale,
      }));

    // 1) Construire les attributs dynamiques attendus par l’API
//    - on filtre les valeurs vides
//    - on stringify (le type ProductPayload impose value: string)
const toAttrArray = (map: Record<string, any>) =>
  Object.entries(map)
    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    .map(([code, value]) => {
      // cherche dans les 2 listes
      const allMeta = [...(attrsProduct || []), ...(attrsVariant || [])] as AttrMeta[];
      const meta = allMeta.find(a => a.code === code);
      const type = (meta?.type ?? "text") as "text" | "int" | "dec" | "bool" | "choice";
      const strVal = typeof value === "boolean" ? String(value) : String(value);
      return { code, type, value: strVal };
    });

// Ces deux maps viennent de ton state (voir message précédent) :
const product_attributes = toAttrArray(prodAttrs);
const variant_attributes = toAttrArray(varAttrs);

// 2) Payload final avec les nouveaux champs
const payload: ProductPayload = {
  nom: formData.nom.trim(),
  slug: formData.slug.trim() || undefined,
  description_courte: formData.description_courte,
  description_long: formData.description_long,
  garantie_mois: formData.garantie_mois,
  poids_grammes: formData.poids_grammes,
  dimensions: formData.dimensions,
  etat: formData.etat,
  categorie: formData.categorie || null,
  marque: marqueValue,
  est_actif: !!formData.est_actif,
  visible: formData.visible ?? 1,

  // Variante
  variante_nom: formData.variante_nom || formData.nom,
  sku: formData.sku,
  code_barres: formData.code_barres,
  prix: formData.prix,
  prix_promo: formData.prix_promo,
  promo_active: !!formData.promo_active,
  promo_debut: formData.promo_debut || null,
  promo_fin: formData.promo_fin || null,
  stock: formData.stock ?? 0,
  couleur: couleurValue,
  prix_achat: formData.prix_achat,
  variante_poids_grammes: formData.variante_poids_grammes,
  variante_est_actif: !!formData.variante_est_actif,

  images: imagesPayload,

  // ⬇️ NOUVEAU
  product_attributes,
  variant_attributes,
};

    try {
      setSubmitting(true);
      const res = await createProductWithVariant(payload as any);

      // 1) message par défaut
let successMsg = "Votre produit a bien été enregistré.";

// 2) si tu veux garder des détails en petit
if (res?.produit_id && res?.variante_id) {
  successMsg += ` (Produit #${res.produit_id}, Variante #${res.variante_id})`;
}

// 3) message “marque existante/créée” optionnel
if (res?.notes?.marque_message) {
  successMsg += ` — ${res.notes.marque_message}`;
}

setToast({ kind: "success", msg: successMsg });

      // reset
      setFormData({
        nom: "",
        slug: "",
        description_courte: "",
        description_long: "",
        garantie_mois: null,
        poids_grammes: null,
        dimensions: "",
        etat: "neuf",
        categorie: "",
        marque: "",
        marque_libre: "",
        est_actif: true,
        visible: 1,
        variante_nom: "",
        sku: "",
        code_barres: "",
        prix: null,
        prix_promo: null,
        promo_active: false,
        promo_debut: "",
        promo_fin: "",
        stock: null,
        prix_achat: null,
        variante_poids_grammes: null,
        variante_est_actif: true,
        couleur: "",
        couleur_libre: "",
      });
      setImages([{ url: "", alt_text: "", position: 1, principale: true, _localFile: null, _uploading: false, _error: null }]);
    } catch (err: any) {
      setToast({ kind: "error", msg: err?.message || "Échec d’enregistrement." });
    } finally {
      setSubmitting(false);
    }
  };
// --- ÉTAT (même design que ComboCreate)
const etatOptions: ComboOption[] = [
  { id: "neuf",           label: "Neuf" },
  { id: "reconditionné",  label: "Reconditionné" },
  { id: "occasion",       label: "Occasion" },
];

const etatValue =
  etatOptions.find(o => String(o.id) === String(formData.etat)) ?? null;

const onEtatChange = (opt: ComboOption | null) => {
  setFormData(p => ({ ...p, etat: (opt?.id as ProduitFormState["etat"]) ?? "neuf" }));
};
type AttrMeta = {
  code: string;
  libelle: string;
  type?: "text" | "int" | "dec" | "bool" | "choice";
  options?: { valeur: string; slug?: string }[] | string[];
};
const MULTI_CHOICE_CODES = new Set(["interface"]);        // ajoute d'autres codes si besoin
const MULTI_SEPARATOR = ", ";                              // ex: "USB-C, HDMI"
const FORCE_DECIMAL = new Set(["frequence"]);  // codes à forcer en décimal


const renderAttrInput = (
  scope: "product" | "variant",
  attr: AttrMeta,
  val: any,
  onChange: (v: any) => void
) => {
  const id = `${scope}_attr_${attr.code}`;

  // ===== CHOIX (select-like) =====
  if (attr.type === "choice") {
    // options de l'API -> ComboOption[]
    const baseOptions: ComboOption[] = (attr.options ?? []).map((o: any) =>
      typeof o === "string" ? { id: o, label: o } : { id: o.valeur, label: o.valeur }
    );

    // options créées par l'utilisateur (persistées au niveau du composant)
    const extras = customAttrChoices[attr.code] ?? [];
    const extraOptions: ComboOption[] = extras.map((v) => ({ id: v, label: v }));

    // fusion + dédoublonnage par label (priorité à l'API)
    const seen = new Set<string>();
    const comboOptions = [...baseOptions, ...extraOptions].filter((o) => {
      const k = o.label.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // ----- cas MULTI (ex: interface)
    if (MULTI_CHOICE_CODES.has(attr.code)) {
      // string -> array de tags
      const currentArr: ComboOption[] =
        (val ? String(val).split(MULTI_SEPARATOR).map(s => s.trim()).filter(Boolean) : [])
          .map(x => comboOptions.find(o => o.label === x) ?? { id: `__new__:${x}`, label: x });

      return (
        <MultiComboCreate
          options={comboOptions}
          value={currentArr}
          placeholder={`-- ${attr.libelle} --`}
          allowCreate
          dropdownPlacement="bottom-start"
          className="w-full"
          menuClassName="z-50"
          onChange={(arr) => {
            // array -> string joinée pour l'API
            const next = arr.map(a => a.label).join(MULTI_SEPARATOR);
            onChange(next);

            // mémorise les nouvelles valeurs créées (celles qui ne sont pas dans baseOptions)
            const baseSet = new Set(baseOptions.map(b => b.label.toLowerCase()));
            const toSave = arr
              .map(a => a.label)
              .filter(lbl => !baseSet.has(lbl.toLowerCase()));
            if (toSave.length) {
              setCustomAttrChoices(prev => {
                const prevList = prev[attr.code] ?? [];
                const prevSet = new Set(prevList.map(x => x.toLowerCase()));
                const merged = [...prevList, ...toSave.filter(x => !prevSet.has(x.toLowerCase()))];
                return { ...prev, [attr.code]: merged };
              });
            }
          }}
        />
      );
    }

    // ----- cas SIMPLE (un seul choix)
    const comboValue: ComboOption | null =
      val == null || val === ""
        ? null
        : comboOptions.find(
            (opt) =>
              String(opt.id) === String(val) || String(opt.label) === String(val)
          )?? { id: `__new__:${String(val)}`, label: String(val) }

    return (
      <ComboCreate
        options={comboOptions}
        value={comboValue}
        placeholder={`-- ${attr.libelle} --`}
        allowCreate
        dropdownPlacement="bottom-start"
        className="w-full"
        menuClassName="z-50"
        onChange={(opt) => {
          onChange(opt ? opt.label : "");
          // mémorise si nouvelle valeur
          if (
            opt &&
            !baseOptions.some((b) => b.label.toLowerCase() === opt.label.toLowerCase())
          ) {
            setCustomAttrChoices((prev) => {
              const prevList = prev[attr.code] ?? [];
              if (prevList.some((x) => x.toLowerCase() === opt.label.toLowerCase()))
                return prev;
              return { ...prev, [attr.code]: [...prevList, opt.label] };
            });
          }
        }}
      />
    );
  }

  // ===== BOOLÉEN =====
  if (attr.type === "bool") {
    return (
      <label className="inline-flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          className="w-5 h-5 outline-[#00A9DC]"
          checked={!!val}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-gray-700">Oui</span>
      </label>
    );
  }

  // ===== TEXT / NUMÉRIQUE =====
  const isInt = attr.type === "int" && !FORCE_DECIMAL.has(attr.code);
  const isDec = attr.type === "dec" || FORCE_DECIMAL.has(attr.code);

  const inputType = (isInt || isDec) ? "number" : "text";
  const step = isDec ? "0.01" : isInt ? "1" : undefined;

  return (
    <input
      id={id}
      type={inputType}
      step={step}
      placeholder={attr.libelle}
      className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
      value={val ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (isInt) onChange(raw === "" ? "" : parseInt(raw, 10));
        else if (isDec) onChange(raw === "" ? "" : Number(raw));
        else onChange(raw);
      }}
    />
  );
};



  return (
     <div
    className="
      bg-gray-50 rounded-xl shadow-lg w-full lg:w-5/5 h-[calc(100vh-220px)] overflow-y-auto pr-2 mb-6">
      {toast && <Toast kind={toast.kind} msg={toast.msg} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-6">
        {/* ===== Produit ===== */}
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="nom" placeholder="Nom du produit *" value={formData.nom} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" required />
          <input type="text" name="slug" placeholder="Slug (auto si vide)" value={formData.slug} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <input type="text" name="description_courte" placeholder="Description courte" value={formData.description_courte} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input type="number" name="garantie_mois" placeholder="Garantie (mois)" value={formData.garantie_mois ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <input type="number" step="0.01" name="poids_grammes" placeholder="Poids (g)" value={formData.poids_grammes ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
        
          <input type="text" name="dimensions" placeholder="Dimensions (ex: 10x20x5)" value={formData.dimensions} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <ComboCreate
            options={etatOptions}
            value={etatValue}
            onChange={onEtatChange}
            placeholder="-- État * --"
            allowCreate={false}
            dropdownPlacement="bottom-start"
            className="w-full"
            menuClassName="z-50"
          />


          <ComboCreate options={categoryOptions} value={categoryValue} onChange={onCategoryChange} placeholder="-- Choisir une catégorie * --" allowCreate={false} dropdownPlacement="bottom-start" className="w-full" menuClassName="z-50" />

          <ComboCreate options={brandOptions} value={brandValue} onChange={onBrandChange} placeholder="-- Choisir une marque * --" allowCreate dropdownPlacement="bottom-start" className="w-full" menuClassName="z-50" />

          <div className="flex items-center gap-4 col-span-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="est_actif" checked={formData.est_actif} onChange={handleChange} className="w-5 h-5 outline-[#00A9DC]" />
              <span className="text-gray-700">Produit actif</span>
            </label>
            <select name="visible" value={formData.visible ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-40 outline-[#00A9DC]">
              <option value="">Visible…</option>
              <option value={1}>1 (oui)</option>
              <option value={0}>0 (non)</option>
            </select>
          </div>
        </div>

        {/* Description longue */}
        <textarea name="description_long" placeholder="Description longue du produit" value={formData.description_long} onChange={handleChange} className="border rounded-lg p-3 bg-gray-100 w-full h-28 resize-none outline-[#00A9DC]" />

        {/* ===== Images ===== */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Images *</h3>
          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={(e) => onSelectFile(idx, e.target.files?.[0] ?? null)} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
                </div>
                <div className="col-span-3">
                  <input type="text" placeholder="Alt text" value={img.alt_text || ""} onChange={(e) => updateImage(idx, { alt_text: e.target.value })} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
                </div>
                <div className="col-span-2">
                  <input type="number" placeholder="Position" value={img.position ?? ""} onChange={(e) => updateImage(idx, { position: e.target.value === "" ? null : Number(e.target.value) })} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
                </div>
                <div className="col-span-1 flex items-center">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="principale" checked={!!img.principale} onChange={() => setPrincipale(idx)} className="w-5 h-5 outline-[#00A9DC]" />
                    <span className="text-gray-700 text-sm">Principale</span>
                  </label>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeImage(idx)} className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" disabled={images.length <= 1} title={images.length <= 1 ? "Au moins 1 image requise" : "Supprimer"}>-</button>
                </div>
                <div className="col-span-12 text-sm">
                  {img._uploading && <span className="text-gray-600">Téléversement en cours…</span>}
                  {!img._uploading && img.url && (
                    <div className="flex items-center gap-3">
                      <img src={img.url} alt={img.alt_text || ""} className="h-16 w-16 object-cover rounded-md border" />
                      <span className="text-gray-700 break-all">{img.url}</span>
                    </div>
                  )}
                  {img._error && <span className="text-rose-600">{img._error}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button type="button" onClick={addImage} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">+ Ajouter une image</button>
          </div>
        </div>

        {/* ===== Variante ===== */}
        <h3 className="text-lg font-semibold mt-2">Variante</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="variante_nom" placeholder="Nom de la variante (optionnel)" value={formData.variante_nom} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <ComboCreate options={colorOptions} value={colorValue} onChange={onColorChange} placeholder="-- Couleur (optionnel) --" allowCreate dropdownPlacement="bottom-start" className="w-full" menuClassName="z-50" />

          <input type="text" name="sku" placeholder="SKU (optionnel)" value={formData.sku} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input type="text" name="code_barres" placeholder="Code-barres (optionnel)" value={formData.code_barres} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <input type="number" step="0.01" name="prix" placeholder="Prix normal *" value={formData.prix ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" required />
          <input type="number" step="0.01" name="prix_promo" placeholder="Prix promo (optionnel)" value={formData.prix_promo ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
         <DateTimePicker
          label="Début promo"
          name="promo_debut"
          value={formData.promo_debut}
          onChange={(name, val) => setFormData(p => ({ ...p, [name]: val }))}
          className="w-full"
        />

        <DateTimePicker
          label="Fin promo"
          name="promo_fin"
          value={formData.promo_fin}
          onChange={(n, v) => setFormData(p => ({ ...p, [n]: v }))}
          minDate={parseLocalDateTime(formData.promo_debut) ?? undefined}
          className="w-full"
        />
          <input type="number" name="stock" placeholder="Stock (optionnel)" value={formData.stock ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <input type="number" step="0.01" name="prix_achat" placeholder="Prix d’achat (optionnel)" value={formData.prix_achat ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input type="number" step="0.01" name="variante_poids_grammes" placeholder="Poids variante (g) (optionnel)" value={formData.variante_poids_grammes ?? ""} onChange={handleChange} className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="promo_active" checked={formData.promo_active} onChange={handleChange} className="w-5 h-5 outline-[#00A9DC]" />
            <span className="text-gray-700">Promotion active</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="variante_est_actif" checked={formData.variante_est_actif} onChange={handleChange} className="w-5 h-5 outline-[#00A9DC]" />
            <span className="text-gray-700">Variante active</span>
          </label>
        </div>
      {/* ===== Spécifications dynamiques ===== */}
<div className="mt-6">
  <h3 className="text-lg font-semibold">Spécifications</h3>

  {!(attrsProduct?.length || attrsVariant?.length) && (
    <p className="text-sm text-gray-500 mt-1">Aucun attribut pour cette catégorie.</p>
  )}

  {!!(attrsProduct?.length || attrsVariant?.length) ? (
    <div className="mt-3 space-y-4">
      {/* Produit */}
      {!!attrsProduct?.length && (
        <div className="rounded-xl border p-4 bg-white/60">
          <h4 className="font-semibold mb-3">Niveau Produit</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(attrsProduct ?? []).map((a: AttrMeta) => (
              <div key={`p_${a.code}`} className="flex flex-col gap-1">
                <label className="text-sm text-gray-700">
                  {a.libelle} <span className="text-gray-400">({a.code})</span>
                </label>
                {renderAttrInput("product", a, prodAttrs[a.code], (v) =>
                  setProdAttrs((m) => ({ ...m, [a.code]: v }))
                )}
              </div>
            ))}
          </div>
        </div>
      )}
{/* Variante */}
{!!attrsVariant?.length && (
  <div className="rounded-xl border p-4 bg-white/60">
    <h4 className="font-semibold mb-3">Niveau Variante</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {(attrsVariant ?? [])
        // masque "couleur" si une FK couleur est déjà choisie dans la variante
        .filter(
          (a: AttrMeta) =>
            !(a.code === "couleur" && (formData.couleur || formData.couleur_libre))
        )
        .map((a: AttrMeta) => (
          <div key={`v_${a.code}`} className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">
              {a.libelle} <span className="text-gray-400">({a.code})</span>
            </label>
            {renderAttrInput("variant", a, varAttrs[a.code], (v) =>
              setVarAttrs((m) => ({ ...m, [a.code]: v }))
            )}
          </div>
        ))}
    </div>
  </div>
)}

    </div>
  ) : null}
</div>

        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="bg-green-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition">
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
