// src/pages/ProductArticle.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDashboardArticle,
  updateDashboardArticle,
  uploadProductImage,
  type ApiArticle,
} from "../hooks/useFetchQuery";

const ProductArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

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
        setError(null);

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
        setError(e?.message || "Impossible de charger l’article.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setError(e?.message || "Échec de l’upload.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    // Si le champ titre est présent, on impose la validation
    if (presentKeys.has("titre") && !form.titre.trim()) {
      setError("Le titre est requis.");
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
      setOk("Article mis à jour ✅");
      setTimeout(() => navigate("/Dashboard", { replace: true }), 800);
    } catch (e: any) {
      setError(e?.message || "Échec de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-xl p-6 shadow">Chargement…</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2">
          {ok}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presentKeys.has("titre") && (
            <input
              name="titre"
              value={form.titre}
              onChange={onChange}
              placeholder="Titre *"
              className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
            />
          )}
          {presentKeys.has("slug") && (
            <input
              name="slug"
              value={form.slug}
              onChange={onChange}
              placeholder="Slug (auto si vide)"
              className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
            />
          )}
        </div>

        {presentKeys.has("extrait") && (
          <textarea
            name="extrait"
            value={form.extrait || ""}
            onChange={onChange}
            placeholder="Extrait"
            className="border rounded-lg p-3 bg-gray-100 w-full h-24 resize-none outline-[#00A9DC]"
          />
        )}

        {presentKeys.has("contenu") && (
          <textarea
            name="contenu"
            value={form.contenu || ""}
            onChange={onChange}
            placeholder="Contenu"
            className="border rounded-lg p-3 bg-gray-100 w-full h-40 resize-y outline-[#00A9DC]"
          />
        )}

        {presentKeys.has("image") && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Image de couverture
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                className="border rounded-lg p-2 bg-gray-100 outline-[#00A9DC]"
                disabled={submitting}
              />
              {form.image?.trim() ? (
                <img
                  src={form.image}
                  alt="cover"
                  className="h-16 w-16 object-cover rounded-md border"
                />
              ) : (
                <span className="text-gray-500 text-sm">Aucune image</span>
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
