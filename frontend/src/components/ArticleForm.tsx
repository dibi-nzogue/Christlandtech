import React, { useState } from "react";
import { createDashboardArticle, uploadProductImage, type NewArticlePayload } from "../hooks/useFetchQuery";
import { useNavigate } from "react-router-dom"; // 👈 ajoute ça
const ArticleForm: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    slug: "",
    extrait: "",
    contenu: "",
    image: "",
    // pas de publie_le, pas de titre
  });

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
    } catch (e: any) {
      setToast({ kind: "error", msg: e?.message || "Échec de l’upload de l’image." });
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: NewArticlePayload = {
      extrait: form.extrait || null,
      contenu: form.contenu || null,
      image: form.image || null,
    };

    try {
      setSubmitting(true);
      await createDashboardArticle(payload);

      // ✅ Reset local form (optionnel)
      setForm({ slug: "", extrait: "", contenu: "", image: "" });

      // ✅ Redirection vers Dashboard + onglet Articles + flash message
      navigate("/dashboard?tab=articles", {
        state: { flash: "Article créé avec succès ✅" },
        replace: true,
      });
    } catch (e: any) {
      setToast({ kind: "error", msg: e?.message || "Échec de la création." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 mb-10 rounded-xl shadow-lg w-full lg:w-4/5">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] rounded-xl shadow-lg px-4 py-3 text-white ${toast.kind === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
          <div className="flex items-start gap-3">
            <span className="font-semibold">{toast.kind === "success" ? "Succès" : "Erreur"}</span>
            <span className="opacity-90">{toast.msg}</span>
            <button type="button" onClick={() => setToast(null)} className="ml-3 text-white/90 hover:text-white" aria-label="Fermer">×</button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="rounded-2xl p-6 space-y-6">

        <textarea
          name="extrait"
          value={form.extrait}
          onChange={onChange}
          placeholder="Extrait (résumé)"
          className="border rounded-lg p-3 bg-gray-100 w-full h-24 resize-none outline-[#00A9DC]"
        />

        <textarea
          name="contenu"
          value={form.contenu}
          onChange={onChange}
          placeholder="Contenu de l’article"
          className="border rounded-lg p-3 bg-gray-100 w-full h-40 resize-y outline-[#00A9DC]"
        />

        <div>
          <label className="block text-sm text-gray-700 mb-1">Image de couverture</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
              className="border rounded-lg p-2 bg-gray-100 outline-[#00A9DC]"
              disabled={submitting}
            />
            {form.image ? (
              <img src={form.image} alt="cover" loading="lazy" className="h-16 w-16 object-cover rounded-md border" />
            ) : (
              <span className="text-gray-500 text-sm">Aucune image</span>
            )}
          </div>
          {form.image && (
            <input
              name="image"
              value={form.image}
              onChange={onChange}
              placeholder="URL image"
              className="mt-2 border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
            />
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-green-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition" disabled={submitting}>
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
