// src/components/ProductEditForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCategories,
  useMarques,
  useCouleurs,
  useFilters,
  uploadProductImage,
  getDashboardProduct,
  updateDashboardProductDeep,
} from "../hooks/useFetchQuery";
import ComboCreate, { type ComboOption } from "./ComboCreate";
import DateTimePicker from "./DateTimePicker";

/* ---------------- Types locaux ---------------- */
type ProduitFormState = {
  nom: string;
  slug: string;
  description_courte: string;
  description_long: string;
  garantie_mois: number | null;
  poids_grammes: number | null;
  dimensions: string;
  etat: "neuf" | "occasion" | "reconditionné";
  categorie: string;      // id ou slug (string)
  marque: string;         // id ou slug (string)
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
  promo_debut: string;
  promo_fin: string;
  stock: number | null;
  prix_achat: number | null;
  variante_poids_grammes: number | null;
  variante_est_actif: boolean;

  // Couleur
  couleur: string;        // id ou slug (string)
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

type AttrMeta = {
  code: string;
  libelle: string;
  type?: "text" | "int" | "dec" | "bool" | "choice";
  options?: { valeur: string; slug?: string }[] | string[];
};

/* ---------------- UI ---------------- */
const Toast: React.FC<{ kind: "success" | "error"; msg: string; onClose(): void }> = ({
  kind, msg, onClose,
}) => (
  <div
    className={`fixed top-4 right-4 z-[9999] rounded-xl shadow-lg px-4 py-3 text-white ${
      kind === "success" ? "bg-emerald-600" : "bg-rose-600"
    }`}
    role="status"
  >
    <div className="flex items-start gap-3">
      <span className="font-semibold">{kind === "success" ? "Succès" : "Erreur"}</span>
      <span className="opacity-90">{msg}</span>
      <button type="button" onClick={onClose} className="ml-3 text-white/90 hover:text-white" aria-label="Fermer">×</button>
    </div>
  </div>
);

const etatOptions: ComboOption[] = [
  { id: "neuf",          label: "Neuf" },
  { id: "reconditionné", label: "Reconditionné" },
  { id: "occasion",      label: "Occasion" },
];


/* =========================================================
   Composant
========================================================= */
const ProductEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: marques } = useMarques();
  const { data: couleurs } = useCouleurs();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  // ⚠️ états pour attributs dynamiques (dans le composant)
  const [prodAttrs, setProdAttrs] = useState<Record<string, any>>({});
  const [varAttrs,  setVarAttrs]  = useState<Record<string, any>>({});

  const [formData, setFormData] = useState<ProduitFormState>({
    nom: "", slug: "", description_courte: "", description_long: "",
    garantie_mois: null, poids_grammes: null, dimensions: "",
    etat: "neuf", categorie: "", marque: "", marque_libre: "",
    est_actif: true, visible: 1,
    variante_nom: "", sku: "", code_barres: "",
    prix: null, prix_promo: null, promo_active: false,
    promo_debut: "", promo_fin: "", stock: null,
    prix_achat: null, variante_poids_grammes: null, variante_est_actif: true,
    couleur: "", couleur_libre: "",
  });

  const [images, setImages] = useState<ImgRow[]>([
    { url: "", alt_text: "", position: 1, principale: true, _localFile: null, _uploading: false, _error: null },
  ]);

  /* ---------- Helpers UI ---------- */
  const toOptions = (rows: any[] | null | undefined): ComboOption[] =>
    (rows ?? []).map((r: any) => ({ id: r.id ?? r.slug ?? r.nom, label: r.nom ?? r.slug ?? String(r) }));

  const categoryOptions = toOptions(categories);
  const brandOptions    = toOptions(marques);
  const colorOptions    = toOptions(couleurs);

  // ⚠️ pour retrouver la valeur, on compare id **ou** slug
  const categoryValue =
    categoryOptions.find(o => String(o.id) === String(formData.categorie)) ??
    categoryOptions.find(o => String(o.label) === String(formData.categorie)) ?? // fallback au cas où tu stockes le nom
    null;

  const brandValue =
    formData.marque === "__custom__"
      ? formData.marque_libre
        ? { id: "__custom__", label: formData.marque_libre }
        : null
      : (brandOptions.find(o => String(o.id) === String(formData.marque)) ??
         brandOptions.find(o => String(o.label) === String(formData.marque)) ??
         null);

  const colorValue =
    formData.couleur === "__custom__"
      ? formData.couleur_libre
        ? { id: "__custom__", label: formData.couleur_libre }
        : null
      : (colorOptions.find(o => String(o.id) === String(formData.couleur)) ??
         colorOptions.find(o => String(o.label) === String(formData.couleur)) ??
         null);

  const onCategoryChange = (opt: ComboOption | null) =>
    setFormData(p => ({ ...p, categorie: opt ? String(opt.id) : "" }));

  const onBrandChange = (opt: ComboOption | null) => {
    if (!opt) return setFormData(p => ({ ...p, marque: "", marque_libre: "" }));
    if (brandOptions.some(o => String(o.id) === String(opt.id))) {
      setFormData(p => ({ ...p, marque: String(opt.id), marque_libre: "" }));
    } else {
      setFormData(p => ({ ...p, marque: "__custom__", marque_libre: opt.label }));
    }
  };

  const onColorChange = (opt: ComboOption | null) => {
    if (!opt) return setFormData(p => ({ ...p, couleur: "", couleur_libre: "" }));
    if (colorOptions.some(o => String(o.id) === String(opt.id))) {
      setFormData(p => ({ ...p, couleur: String(opt.id), couleur_libre: "" }));
    } else {
      setFormData(p => ({ ...p, couleur: "__custom__", couleur_libre: opt.label }));
    }
  };

  const etatValue = etatOptions.find(o => String(o.id) === String(formData.etat)) ?? null;
  const onEtatChange = (opt: ComboOption | null) =>
    setFormData(p => ({ ...p, etat: (opt?.id as ProduitFormState["etat"]) ?? "neuf" }));

  const addImage = () =>
    setImages(arr => [
      ...arr,
      { url: "", alt_text: "", position: (arr[arr.length - 1]?.position ?? arr.length) + 1, principale: false, _localFile: null, _uploading: false, _error: null },
    ]);

  const removeImage = (idx: number) =>
    setImages(arr => (arr.length <= 1 ? arr : arr.filter((_, i) => i !== idx)));

  const updateImage = (idx: number, patch: Partial<ImgRow>) =>
    setImages(arr => arr.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const setPrincipale = (idx: number) =>
    setImages(arr => arr.map((r, i) => ({ ...r, principale: i === idx })));

  const onSelectFile = async (idx: number, file: File | null) => {
    if (!file) return updateImage(idx, { _localFile: null, _error: null });
    updateImage(idx, { _localFile: file, _uploading: true, _error: null });
    try {
      const { url } = await uploadProductImage(file);
      updateImage(idx, { url, _uploading: false, _error: null });
      setImages(arr => {
        if (!arr.some(a => a.principale)) return arr.map((a, i) => (i === idx ? { ...a, principale: true } : a));
        return arr;
      });
    } catch (e: any) {
      updateImage(idx, { _uploading: false, _error: e?.message || "Upload échoué" });
      setToast({ kind: "error", msg: e?.message || "Échec de l’upload de l’image." });
    }
  };

  const numericKeys = new Set([
    "garantie_mois", "poids_grammes", "prix", "prix_promo", "stock", "prix_achat", "variante_poids_grammes",
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

  /* ---------- Chargement du produit + variantes + attributs ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Essayez de demander un détail complet (ignoré si non supporté)
   // 1) charge le payload “edit”
const prod: any = await getDashboardProduct(Number(id));

// 2) variante unique (payload.variant)
const firstVar = prod?.variant ?? null;

// 3) préremplissage “Produit”
setFormData((p) => ({
  ...p,
  nom: prod?.nom ?? "",
  slug: prod?.slug ?? "",
  description_courte: prod?.description_courte ?? "",
  description_long: prod?.description_long ?? "",
  garantie_mois: prod?.garantie_mois ?? null,
  poids_grammes: prod?.poids_grammes ?? null,
  dimensions: prod?.dimensions ?? "",
  etat: prod?.etat ?? "neuf",
  // ⚠️ catégorie: id prioritaire, sinon slug
  categorie: prod?.categorie?.id ?? prod?.categorie?.slug ?? "",
  // ⚠️ marque: id prioritaire, sinon slug/nom
  marque: prod?.marque?.id ?? prod?.marque?.slug ?? prod?.marque?.nom ?? "",
  est_actif: !!prod?.est_actif,
  visible: (prod?.visible ?? 1) as 0 | 1,
  // ---------- Variante ----------
  variante_nom: firstVar?.nom ?? "",
  sku: firstVar?.sku ?? "",
  code_barres: firstVar?.code_barres ?? "",
  prix: firstVar?.prix ?? null,
  prix_promo: firstVar?.prix_promo ?? null,
  promo_active: !!firstVar?.promo_active,
  promo_debut: firstVar?.promo_debut ? String(firstVar.promo_debut).slice(0, 16) : "",
  promo_fin:   firstVar?.promo_fin   ? String(firstVar.promo_fin).slice(0, 16)   : "",
  stock: firstVar?.stock ?? null,
  prix_achat: firstVar?.prix_achat ?? null,
  variante_poids_grammes: firstVar?.variante_poids_grammes ?? null,
  variante_est_actif: !!firstVar?.variante_est_actif,
  // Couleur: id > slug > label
  couleur: firstVar?.couleur?.id ?? firstVar?.couleur?.slug ?? firstVar?.couleur ?? "",
  couleur_libre: "",
}));

// 4) images
setImages(
  Array.isArray(prod?.images) && prod.images.length
    ? prod.images.map((im: any, i: number) => ({
        url: im.url,
        alt_text: im.alt_text ?? "",
        position: im.position ?? i + 1,
        principale: !!im.principale || i === 0,
        _localFile: null, _uploading: false, _error: null,
      }))
    : [{ url: "", alt_text: "", position: 1, principale: true, _localFile: null, _uploading: false, _error: null }]
);

// 5) Attributs dynamiques **déjà remplis**
const toMap = (arr: any[]) => {
  const m: Record<string, any> = {};
  (arr || []).forEach((a: any) => {
    const code = a?.code; const value = a?.value;
    if (code && value !== undefined && value !== null && value !== "") m[code] = value;
  });
  return m;
};

setProdAttrs(toMap(prod?.product_attributes ?? []));
setVarAttrs(toMap(prod?.variant_attributes ?? []));

      } catch (e: any) {
        setToast({ kind: "error", msg: e?.message || "Impossible de charger le produit." });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // Slug de catégorie pour charger les filtres (spécifications)
  const selectedCategorySlug = useMemo(() => {
    if (!formData?.categorie || !Array.isArray(categories)) return "";
    // on accepte id OU slug : essaye d’abord par id, sinon par slug
    const byId = categories.find((c: any) => String(c.id) === String(formData.categorie));
    if (byId) return byId.slug ?? "";
    const bySlug = categories.find((c: any) => String(c.slug) === String(formData.categorie));
    return bySlug?.slug ?? "";
  }, [formData?.categorie, categories]);

  const { data: filters } = useFilters({
    category: selectedCategorySlug || undefined,
    subcategory: undefined,
  });

  const attrsProduct: AttrMeta[] = filters?.attributes_product ?? filters?.attributes ?? [];
  const attrsVariant: AttrMeta[] = filters?.attributes_variant ?? filters?.attributes ?? [];

  /* ---------- Validation & Submit ---------- */
  const validateRequired = (): string | null => {
    if (!formData.nom.trim()) return "Le nom du produit est requis.";
    if (formData.visible !== 0 && formData.visible !== 1) return "Visible doit être 1 (oui) ou 0 (non).";
    if (formData.prix == null) return "Le prix de la variante est requis.";
    if (!formData.marque && !formData.marque_libre.trim()) return "La marque est requise.";
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

    const marqueValue =
      formData.marque === "__custom__" ? formData.marque_libre.trim() || null : formData.marque || null;
    const couleurValue =
      formData.couleur === "__custom__" ? formData.couleur_libre.trim() || null : formData.couleur || null;

    const imagesPayload = images
      .filter((i) => (i.url || "").trim() !== "")
      .map((i) => ({
        url: i.url.trim(),
        alt_text: (i.alt_text || "").trim(),
        position: i.position == null || Number.isNaN(Number(i.position)) ? null : Number(i.position),
        principale: !!i.principale,
      }));

    const toAttrArray = (map: Record<string, any>) =>
      Object.entries(map)
        .filter(([, v]) => v !== "" && v !== null && v !== undefined)
        .map(([code, value]) => {
          const meta = [...attrsProduct, ...attrsVariant].find(a => a.code === code);
          const type = (meta?.type ?? "text") as "text" | "int" | "dec" | "bool" | "choice";
          const strVal = typeof value === "boolean" ? String(value) : String(value);
          return { code, type, value: strVal };
        });

    const product_attributes = toAttrArray(prodAttrs);
    const variant_attributes = toAttrArray(varAttrs);

    const payload: any = {
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

      // Variante (maj de la 1ère)
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

      product_attributes,
      variant_attributes,
      images: imagesPayload,
    };

    try {
      setSubmitting(true);
      await updateDashboardProductDeep(Number(id), payload);
      navigate("/Dashboard", { replace: true, state: { flash: "Produit mis à jour ✅" } });

    } catch (err: any) {
      setToast({ kind: "error", msg: err?.message || "Échec de la mise à jour." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="bg-white rounded-xl p-6 shadow">Chargement…</div>;

  /* ---------- Rendu d’un input pour un attribut ---------- */
  const renderAttrInput = (
  scope: "product" | "variant",
  attr: AttrMeta,
  value: any,
  onChange: (v: any) => void
) => {
  const inputId = `${scope}_attr_${attr.code}`;

  if (attr.type === "choice") {
    const opts = (attr.options ?? []).map((o: any) =>
      typeof o === "string" ? { id: o, label: o } : { id: o.valeur, label: o.valeur }
    );
    const current =
      value == null || value === ""
        ? null
        : opts.find(o => o.label === String(value)) ?? { id: value, label: String(value) };

    return (
      <>
        <label htmlFor={inputId} className="sr-only">{attr.libelle}</label>
        <ComboCreate
          options={opts}
          value={current}
          onChange={(opt) => onChange(opt ? opt.label : "")}
          placeholder={`-- ${attr.libelle} --`}
          allowCreate
          className="w-full"
          menuClassName="z-50"
          // @ts-expect-error: ComboCreate n'expose pas 'inputId' mais on l'ignore
          inputId={inputId}
        />
      </>
    );
  }

  if (attr.type === "bool") {
    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2">
        <input
          id={inputId}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 outline-[#00A9DC]"
        />
        <span>Oui</span>
      </label>
    );
  }

  const isNumber = attr.type === "int" || attr.type === "dec";
  return (
    <>
      <label htmlFor={inputId} className="sr-only">{attr.libelle}</label>
      <input
        id={inputId}
        type={isNumber ? "number" : "text"}
        step={attr.type === "dec" ? "0.01" : undefined}
        value={value ?? ""}
        onChange={(e) =>
          onChange(isNumber ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)
        }
        placeholder={attr.libelle}
        className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
      />
    </>
  );
};


  /* ---------- UI ---------- */
return (
  <div
    className="
      bg-gray-50 rounded-xl shadow-lg w-full lg:w-5/5
      h-full overflow-y-auto overscroll-contain
      pr-2 pb-6
    "
  >
      {toast && <Toast kind={toast.kind} msg={toast.msg} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-6">
        {/* ===== Produit ===== */}
        <div className="grid grid-cols-2 gap-4">
          <input name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom du produit *" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug (auto si vide)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <input name="description_courte" value={formData.description_courte} onChange={handleChange} placeholder="Description courte" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input type="number" name="garantie_mois" value={formData.garantie_mois ?? ""} onChange={handleChange} placeholder="Garantie (mois)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <input type="number" step="0.01" name="poids_grammes" value={formData.poids_grammes ?? ""} onChange={handleChange} placeholder="Poids (g)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="Dimensions" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <ComboCreate options={etatOptions} value={etatValue} onChange={onEtatChange} placeholder="-- État * --" allowCreate={false} className="w-full" menuClassName="z-50" />
          <ComboCreate options={categoryOptions} value={categoryValue} onChange={onCategoryChange} placeholder="-- Choisir une catégorie * --" allowCreate={false} className="w-full" menuClassName="z-50" />

          <ComboCreate options={brandOptions} value={brandValue} onChange={onBrandChange} placeholder="-- Choisir une marque * --" allowCreate className="w-full" menuClassName="z-50" />

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

        <textarea name="description_long" value={formData.description_long} onChange={handleChange} placeholder="Description longue" className="border rounded-lg p-3 bg-gray-100 w-full h-28 resize-none outline-[#00A9DC]" />

        {/* ===== Images ===== */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Images *</h3>
          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
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
          <input name="variante_nom" value={formData.variante_nom} onChange={handleChange} placeholder="Nom de la variante (optionnel)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <ComboCreate options={colorOptions} value={colorValue} onChange={onColorChange} placeholder="-- Couleur (optionnel) --" allowCreate className="w-full" menuClassName="z-50" />

          <input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU (optionnel)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input name="code_barres" value={formData.code_barres} onChange={handleChange} placeholder="Code-barres (optionnel)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <input type="number" step="0.01" name="prix" value={formData.prix ?? ""} onChange={handleChange} placeholder="Prix normal *" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input type="number" step="0.01" name="prix_promo" value={formData.prix_promo ?? ""} onChange={handleChange} placeholder="Prix promo (optionnel)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

          <DateTimePicker label="Début promo" name="promo_debut" value={formData.promo_debut} onChange={(n, v) => setFormData(p => ({ ...p, [n]: v }))} className="w-full" />
          <DateTimePicker label="Fin promo"   name="promo_fin"   value={formData.promo_fin}   onChange={(n, v) => setFormData(p => ({ ...p, [n]: v }))} className="w-full" />

          <input type="number" name="stock" value={formData.stock ?? ""} onChange={handleChange} placeholder="Stock (optionnel)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input type="number" step="0.01" name="prix_achat" value={formData.prix_achat ?? ""} onChange={handleChange} placeholder="Prix d’achat (optionnel)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />
          <input type="number" step="0.01" name="variante_poids_grammes" value={formData.variante_poids_grammes ?? ""} onChange={handleChange} placeholder="Poids variante (g) (optionnel)" className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]" />

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

          {!attrsProduct.length && !attrsVariant.length && (
            <p className="text-sm text-gray-500 mt-1">Aucun attribut pour cette catégorie.</p>
          )}

          {!!attrsProduct.length && (
            <div className="rounded-xl border p-4 bg-white/60 mt-3">
              <h4 className="font-semibold mb-3">Niveau Produit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attrsProduct.map((a) => (
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

          {!!attrsVariant.length && (
            <div className="rounded-xl border p-4 bg-white/60 mt-3">
              <h4 className="font-semibold mb-3">Niveau Variante</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attrsVariant.map((a) => (
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

        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="bg-[#00A9DC] disabled:opacity-60 text-white px-5 py-2 rounded-lg hover:bg-[#0797c4] transition">
            {submitting ? "Mise à jour..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEditForm;
