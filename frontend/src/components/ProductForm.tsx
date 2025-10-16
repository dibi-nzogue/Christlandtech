import React, { useState } from "react";

type Produit = {
  nom: string;
  slug: string;
  description_courte: string;
  description_long: string;
  garantie_mois: number | null;
  poids_grammes: number | null;
  est_actif: boolean;
  visible: number | null;
  prix_reference_avant: number | null;
  cree_le: string;
  dimensions: string;
  categorie: string;
  marque: string;
};

const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState<Produit>({
    nom: "",
    slug: "",
    description_courte: "",
    description_long: "",
    garantie_mois: null,
    poids_grammes: null,
    est_actif: false,
    visible: null,
    prix_reference_avant: null,
    cree_le: "",
    dimensions: "",
    categorie: "",
    marque: "",
  });

  const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
    const { name, value, type } = e.target;
    const newValue =
        type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;

    setFormData((prev) => ({
        ...prev,
        [name]: newValue,
    }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Données du produit :", formData);
  };

  return (
    <div className=" bg-gray-50 mb-10 rounded-xl shadow-lg w-full lg:w-4/5">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-5"
      >

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom du produit"
            value={formData.nom}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug"
            value={formData.slug}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />

          <input
            type="text"
            name="description_courte"
            placeholder="Description courte"
            value={formData.description_courte}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />
          <input
            type="number"
            name="garantie_mois"
            placeholder="Garantie (mois)"
            value={formData.garantie_mois ?? ""}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />

          <input
            type="number"
            step="0.01"
            name="poids_grammes"
            placeholder="Poids (g)"
            value={formData.poids_grammes ?? ""}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />
          <input
            type="number"
            name="visible"
            placeholder="Visible (1/0)"
            value={formData.visible ?? ""}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />

          <input
            type="number"
            name="prix_reference_avant"
            placeholder="Prix avant réduction"
            value={formData.prix_reference_avant ?? ""}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />
          <input
            type="text"
            name="dimensions"
            placeholder="Dimensions (ex: 10x20x5)"
            value={formData.dimensions}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />

          <input
            type="datetime-local"
            name="cree_le"
            value={formData.cree_le}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          />

          <select
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          >
            <option value="">-- Choisir une catégorie --</option>
            <option value="1">Électronique</option>
            <option value="2">Maison</option>
            <option value="3">Autre</option>
          </select>

          <select
            name="marque"
            value={formData.marque}
            onChange={handleChange}
            className="border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]"
          >
            <option value="">-- Choisir une marque --</option>
            <option value="1">Samsung</option>
            <option value="2">Apple</option>
            <option value="3">Dell</option>
          </select>

          <div className="flex items-center space-x-2 col-span-2">
            <input
              type="checkbox"
              name="est_actif"
              checked={formData.est_actif}
              onChange={handleChange}
              className="w-5 h-5 outline-[#00A9DC]"
            />
            <label htmlFor="est_actif" className="text-gray-700">
              Produit actif
            </label>
          </div>
        </div>

        <textarea
          name="description_long"
          placeholder="Description longue du produit"
          value={formData.description_long}
          onChange={handleChange}
          className="border rounded-lg p-3 bg-gray-100 w-full h-32 resize-none outline-[#00A9DC]"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
