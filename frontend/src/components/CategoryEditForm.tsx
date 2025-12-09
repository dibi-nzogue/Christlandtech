// src/components/CategoryEditForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDashboardCategory,
  updateDashboardCategory,
  getDashboardCategories,
  uploadProductImage,  
  createDashboardCategory,        // ✅ on utilise le même helper d’upload
} from "../hooks/useFetchQuery";
import type { ApiCategory } from "../hooks/useFetchQuery";
import ComboCreate, { type ComboOption } from "./ComboCreate";

/* ---------- Toast réutilisable ---------- */
const Toast: React.FC<{
  kind: "success" | "error";
  msg: string;
  onClose(): void;
}> = ({ kind, msg, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-[9999] rounded-xl shadow-lg px-4 py-3 text-white ${
      kind === "success" ? "bg-emerald-600" : "bg-rose-600"
    }`}
    role="status"
  >
    <div className="flex items-start gap-3">
      <span className="font-semibold">
        {kind === "success" ? "Succès" : "Erreur"}
      </span>
      <span className="opacity-90">{msg}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-3 text-white/90 hover:text-white"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  </div>
);

/* ---------- Type local formulaire ---------- */
type CategoryFormState = {
  nom: string;
  slug: string;           // on garde pour le backend mais on ne l’affiche pas
  description: string;
  parent: string | "";    // id du parent (string) ou "" quand pas de parent
  image_url: string;      // ✅ URL de l’image
  est_actif: boolean;
};

const CategoryEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    msg: string;
  } | null>(null);

  const [formData, setFormData] = useState<CategoryFormState>({
    nom: "",
    slug: "",
    description: "",
    parent: "",
    image_url: "",
    est_actif: true,
  });

  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
 

  const [imageUploading, setImageUploading] = useState(false);

// 🟢 Sous-catégories (NOUVELLES uniquement)
const [newSubCategories, setNewSubCategories] = useState<{
  nom: string;
  description: string;
  image_url: string;
  est_actif: boolean;
}[]>([]);

// ➕ Ajouter une sous-catégorie vide
const addNewSubCategory = () => {
  setNewSubCategories((prev) => [
    ...prev,
    { nom: "", description: "", image_url: "", est_actif: true },
  ]);
};

// ❌ Supprimer une sous-catégorie
const removeNewSubCategory = (index: number) => {
  setNewSubCategories((prev) => prev.filter((_, i) => i !== index));
};

// ✏️ Modifier une sous-catégorie
const handleNewSubChange = (
  index: number,
  field: "nom" | "description" | "image_url" | "est_actif",
  value: string | boolean
) => {
  setNewSubCategories((prev) =>
    prev.map((sub, i) => (i === index ? { ...sub, [field]: value } : sub))
  );
};

// 📷 Upload image sous-catégorie
const handleNewSubImageFileChange = async (
  index: number,
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const { url } = await uploadProductImage(file, newSubCategories[index].nom);
    handleNewSubChange(index, "image_url", url);
  } catch {
    setToast({ kind: "error", msg: "Erreur upload image sous-catégorie." });
  }
};



  const categoryId = useMemo(() => Number(id), [id]);

  /* ---------- Helpers ---------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const t = e.currentTarget;
    if (t instanceof HTMLInputElement && t.type === "checkbox") {
      setFormData((p) => ({ ...p, [t.name]: t.checked }));
      return;
    }
    setFormData((p) => ({ ...p, [t.name]: t.value }));
  };

  // Upload d’image
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      // alt_text = nom de la catégorie
      const { url } = await uploadProductImage(file, formData.nom || undefined);

      setFormData((prev) => ({
        ...prev,
        image_url: url,
      }));

      setToast({
        kind: "success",
        msg: "Image uploadée avec succès.",
      });
    } catch (err: any) {
      setToast({
        kind: "error",
        msg: err?.message || "Échec de l’upload de l’image.",
      });
    } finally {
      setImageUploading(false);
      // reset input file pour pouvoir re-sélectionner la même image au besoin
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_url: "",
    }));
  };

  // Options pour le parent : uniquement catégories SANS parent, hors catégorie courante
const parentOptions: ComboOption[] = useMemo(() => {
  return (allCategories ?? [])
    .filter(
      (c) =>
        (c.parent_id === null || c.parent_id === undefined) &&
        String(c.id) !== String(categoryId)
    )
    .map((c) => ({
      id: String(c.id),
      label: c.nom,
    }));
}, [allCategories, categoryId]);

const parentValue: ComboOption | null =
  parentOptions.find((o) => String(o.id) === String(formData.parent)) ?? null;

const onParentChange = (opt: ComboOption | null) => {
  setFormData((p) => ({
    ...p,
    parent: opt ? String(opt.id) : "",
  }));
};

const isRootCategory = !formData.parent;


  /* ---------- Chargement initial : catégorie + liste catégories ---------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // 1) détails de la catégorie à éditer
        const cat: any = await getDashboardCategory(categoryId);
        if (!mounted) return;

        setFormData({
          nom: cat?.nom ?? "",
          slug: cat?.slug ?? "",
          description: cat?.description ?? "",
          parent:
                cat?.parent_id != null && cat?.parent_id !== undefined
                ? String(cat.parent_id)
                : "",
          image_url: cat?.image_url ?? "",
          est_actif: !!cat?.est_actif,
        });

     
        // 2) liste complète des catégories (pour le choix du parent)
        const list = await getDashboardCategories({
          page: 1,
          page_size: 500,
          q: "",
        });

        const rows =
          (list as any).results ??
          (list as any).items ??
          (Array.isArray(list) ? list : []) ??
          [];

        if (!mounted) return;
        setAllCategories(rows);
      } catch (e: any) {
        if (!mounted) return;
        setToast({
          kind: "error",
          msg: e?.message ,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  /* ---------- Validation & submit ---------- */
  const validateRequired = (): string | null => {
    if (!formData.nom.trim()) return "Le nom de la catégorie est requis.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateRequired();
    if (err) {
      setToast({ kind: "error", msg: err });
      return;
    }

    const payload: any = {
      nom: formData.nom.trim(),
      slug: formData.slug?.trim() || undefined,    // on le renvoie si présent
      description: formData.description,
      parent: isRootCategory ? null : formData.parent,
      image_url: formData.image_url || null,       // ✅ image URL finale
      est_actif: !!formData.est_actif,
    };

    try {
      setSubmitting(true);
      await updateDashboardCategory(categoryId, payload);

      setToast({
        kind: "success",
        msg: "Catégorie mise à jour avec succès.",
      });
// Ajouter les nouvelles sous-catégories si root
if (isRootCategory && newSubCategories.length > 0) {
  for (const sub of newSubCategories) {
    if (!sub.nom.trim()) continue;
    await createDashboardCategory({
      nom: sub.nom.trim(),
      description: sub.description,
      parent: categoryId,
      image_url: sub.image_url || null,
      est_actif: sub.est_actif,
    });
  }
}

      setTimeout(() => {
        navigate("/dashboard?tab=categories", {
          replace: true,
          state: { flash: "Catégorie mise à jour ✅" },
        });
      }, 600);
    } catch (e: any) {
      setToast({
        kind: "error",
        msg: e?.message || "Échec de la mise à jour de la catégorie.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow">Chargement…</div>
    );
  }

  /* ---------- UI ---------- */
   return (
    <div className="bg-gray-50 rounded-xl shadow-lg w-full h-full overflow-hidden">
      {toast && (
        <Toast
          kind={toast.kind}
          msg={toast.msg}
          onClose={() => setToast(null)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-6  h-full overflow-y-auto overscroll-contain pr-2 pb-6"
      >
        <h2 className="text-xl font-semibold mb-2">
          Modifier la catégorie
        </h2>

        {/* Nom uniquement (slug caché) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <div className="flex flex-col gap-1">
            <label htmlFor="nom" className="text-sm text-gray-700">
              Nom de la catégorie *
            </label>
            <input
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom de la catégorie *"
              className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
            />
          </div>
        </div>

        {/* Image (upload + aperçu) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">
            Image de la catégorie
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="block w-full text-sm text-gray-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-[#00A9DC] file:text-white
                       hover:file:bg-[#0797c4]"
          />

          {imageUploading && (
            <span className="text-xs text-gray-500">
              Upload de l’image en cours...
            </span>
          )}

          {formData.image_url && (
            <div className="flex items-center gap-4 mt-2">
              <img
                src={formData.image_url}
                alt={formData.nom}
                loading="lazy"
                width={300}
                      height={300}
                className="h-20 w-20 object-cover rounded-lg border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/Dispositivos.webp";
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-sm text-red-600 hover:underline"
              >
                Supprimer l’image
              </button>
            </div>
          )}
        </div>

        {/* Parent : NON affiché pour une catégorie parent (root) */}
       {/* Parent : NON affiché pour une catégorie parent (root) */}
{!isRootCategory && (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-700">
      Catégorie parente
      <span className="text-gray-400 text-xs ml-1">
        (laisse vide pour une catégorie principale)
      </span>
    </label>
    <ComboCreate
      options={parentOptions}
      value={parentValue}
      onChange={onParentChange}
      placeholder="-- Aucune (catégorie parent) --"
      allowCreate={false}
      className="w-full"
      menuClassName="z-50"
    />
  </div>
)}


{/* 🟡 Bloc d’ajout de sous-catégories — UNIQUEMENT si catégorie principale */}
{isRootCategory && (
  <div className="border rounded-xl p-4 bg-white space-y-3 max-h-72 overflow-y-auto">

    <div className="flex items-center justify-between">
      <h3 className="font-medium text-sm md:text-base">
        Ajouter des sous-catégories
      </h3>
      <button
        type="button"
        onClick={addNewSubCategory}
        className="text-xs px-3 py-1 bg-[#00A9DC] text-white rounded-full hover:bg-[#0797c4]"
      >
        + Ajouter une sous-catégorie
      </button>
    </div>

    {newSubCategories.length === 0 && (
      <p className="text-xs text-gray-500">
        Cliquez sur le bouton pour ajouter une ou plusieurs sous-catégories.
      </p>
    )}

    {newSubCategories.map((sub, index) => (
      <div key={index} className="border rounded-lg p-3 bg-gray-50 space-y-2">
        
        {/* Header */}
        <div className="flex justify-between">
          <span className="text-sm font-medium">Sous-catégorie #{index + 1}</span>
          <button
            type="button"
            onClick={() => removeNewSubCategory(index)}
            className="text-xs text-red-600 hover:underline"
          >
            Supprimer
          </button>
        </div>

        {/* Nom */}
        <input
          type="text"
          value={sub.nom}
          onChange={(e) => handleNewSubChange(index, "nom", e.target.value)}
          placeholder="Nom de la sous-catégorie"
          className="border rounded-lg p-2 w-full text-sm"
        />

        {/* Description */}
        <textarea
          value={sub.description}
          onChange={(e) =>
            handleNewSubChange(index, "description", e.target.value)
          }
          placeholder="Description"
          className="border rounded-lg p-2 w-full text-sm"
        />

        {/* Image */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleNewSubImageFileChange(index, e)}
            className="block text-xs"
          />
          {sub.image_url && (
            <img
              src={sub.image_url}
              width={300}
                      height={300}
              loading="lazy"
              alt={sub.nom}
              className="mt-2 h-16 w-16 object-cover rounded-md border"
            />
          )}
        </div>

        {/* Checkbox active */}
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={sub.est_actif}
            onChange={(e) =>
              handleNewSubChange(index, "est_actif", e.target.checked)
            }
            className="w-4 h-4"
          />
          <span className="text-xs">Sous-catégorie active</span>
        </label>
      </div>
    ))}
  </div>
)}





        {/* Description */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="description"
            className="text-sm text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description de la catégorie"
            className="border rounded-lg p-3 bg-gray-100 w-full h-28 resize-none outline-[#00A9DC]"
          />
        </div>

        {/* Statut */}
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="est_actif"
              checked={formData.est_actif}
              onChange={handleChange}
              className="w-5 h-5 outline-[#00A9DC]"
            />
            <span className="text-gray-700">Catégorie active</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#00A9DC] disabled:opacity-60 text-white px-5 py-2 rounded-lg hover:bg-[#0797c4] transition"
          >
            {submitting
              ? "Mise à jour..."
              : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryEditForm;
