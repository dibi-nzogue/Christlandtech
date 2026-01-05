
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDashboardArticle,
  updateDashboardArticle,
  uploadProductImage,
  type ApiArticle,
} from "../hooks/useFetchQuery";

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

const ProductArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    kind: "success" | "error";
    msg: string;
  } | null>(null);

  // Champs ArticlesBlog
  const [form, setForm] = useState<{
    titre: string;
    slug: string;
    extrait: string;
    contenu: string;
    image: string;
  }>({
    titre: "",
    slug: "",
    extrait: "",
    contenu: "",
    image: "",
  });

  // ✅ clés réellement renvoyées par /edit/
  const [presentKeys, setPresentKeys] = useState<Set<string>>(new Set());

  // Charger l’article (payload réduit /edit/)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        const a = await getDashboardArticle(Number(id));
        if (!mounted) return;

        // mémorise les champs reçus
        setPresentKeys(new Set(Object.keys(a || {})));

        // préremplit uniquement ce qui existe
        setForm((prev) => ({
          ...prev,
          ...(a.titre !== undefined ? { titre: a.titre || "" } : {}),
          ...(a.slug !== undefined ? { slug: a.slug || "" } : {}),
          ...(a.extrait !== undefined ? { extrait: a.extrait || "" } : {}),
          ...(a.contenu !== undefined ? { contenu: a.contenu || "" } : {}),
          ...(a.image !== undefined ? { image: a.image || "" } : {}),
        }));
      } catch (e: any) {
        setToast({
          kind: "error",
          msg: e?.message || "Impossible de charger l’article.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onPickImage = async (file: File | null) => {
    if (!file) return;
    try {
      setSubmitting(true);
      const { url } = await uploadProductImage(file);
      setForm((p) => ({ ...p, image: url }));
      // S'assure qu'on affichera le champ image si le backend ne l'avait pas renvoyé
      setPresentKeys((s) => new Set([...Array.from(s), "image"]));
    } catch (e: any) {
      setToast({
        kind: "error",
        msg: e?.message || "Échec de l’upload de l’image.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Si le champ titre est présent, on impose la validation
    if (presentKeys.has("titre") && !form.titre.trim()) {
      setToast({ kind: "error", msg: "Le titre est requis." });
      return;
    }

    try {
      setSubmitting(true);

      // ⚑ Construire un payload PARTIEL uniquement avec les clés présentes
      const payload: Partial<ApiArticle> = {};
      if (presentKeys.has("titre")) payload.titre = form.titre.trim();
      if (presentKeys.has("slug")) {
        const s = form.slug.trim();
        if (s) payload.slug = s;
      }
      if (presentKeys.has("extrait"))
        payload.extrait = form.extrait?.trim() ? form.extrait.trim() : null;
      if (presentKeys.has("contenu"))
        payload.contenu = form.contenu?.trim() ? form.contenu.trim() : null;
      if (presentKeys.has("image"))
        payload.image = form.image?.trim() ? form.image.trim() : null;

      await updateDashboardArticle(Number(id), payload);
      setToast({ kind: "success", msg: "Article mis à jour ✅" });

      setTimeout(
        () => navigate("/dashboard", { replace: true }),
        800
      );
    } catch (e: any) {
      setToast({
        kind: "error",
        msg: e?.message || "Échec de la mise à jour.",
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

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full relative">
      {toast && (
        <Toast
          kind={toast.kind}
          msg={toast.msg}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Titre + slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presentKeys.has("titre") && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Titre *</label>
              <input
                name="titre"
                value={form.titre}
                onChange={onChange}
                placeholder="Titre *"
                className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
              />
            </div>
          )}
          {presentKeys.has("slug") && (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={onChange}
                placeholder="Slug (auto si vide)"
                className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
              />
            </div>
          )}
        </div>

        {/* Extrait */}
        {presentKeys.has("extrait") && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Extrait</label>
            <textarea
              name="extrait"
              value={form.extrait || ""}
              onChange={onChange}
              placeholder="Extrait"
              className="border rounded-lg p-3 bg-gray-100 w-full h-24 resize-none outline-[#00A9DC]"
            />
          </div>
        )}

        {/* Contenu */}
        {presentKeys.has("contenu") && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Contenu</label>
            <textarea
              name="contenu"
              value={form.contenu || ""}
              onChange={onChange}
              placeholder="Contenu"
              className="border rounded-lg p-3 bg-gray-100 w-full h-40 resize-y outline-[#00A9DC]"
            />
          </div>
        )}

        {/* Image de couverture */}
        {presentKeys.has("image") && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Image de couverture
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  onPickImage(e.target.files?.[0] ?? null)
                }
                className="border rounded-lg p-2 bg-gray-100 outline-[#00A9DC]"
                disabled={submitting}
              />
              {form.image?.trim() ? (
                <img
                  width={300}
                  height={300}
                  src={form.image}
                  alt="cover"
                  loading="lazy"
                  className="h-16 w-16 object-cover rounded-md border"
                />
              ) : (
                <span className="text-gray-500 text-sm">
                  Aucune image
                </span>
              )}
            </div>
            {form.image?.trim() && (
              <input
                name="image"
                value={form.image}
                onChange={onChange}
                placeholder="URL image"
                className="mt-2 border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
              />
            )}
          </div>
        )}

        {/* Boutons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-[#00A9DC] disabled:opacity-60 text-white px-5 py-2 rounded-lg hover:bg-[#0797c4] transition"
            disabled={submitting}
          >
            {submitting ? "Mise à jour..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductArticle;
