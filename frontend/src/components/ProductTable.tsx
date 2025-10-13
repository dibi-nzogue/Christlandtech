import { Trash2, Plus } from "lucide-react";

import lenovo from "../assets/images/lenovo.webp";
import hp from "../assets/images/hp.jpg";
import dell from "../assets/images/dell.jpg";

type Product = {
  id: number;
  name: string;
  price: string;
  qty: number;
  img: string;
};

const products: Product[] = [
  { id: 1, name: "Dell Latitude", price: "120.000Cfa", qty: 10, img: lenovo },
  { id: 2, name: "PS5", price: "450.000Cfa", qty: 35, img: hp },
  { id: 3, name: "HP Elitebook", price: "90.000Cfa", qty: 5, img: dell },
  { id: 4, name: "Dell Latitude", price: "120.000Cfa", qty: 10, img: lenovo },
  { id: 5, name: "PS5", price: "450.000Cfa", qty: 35, img: hp },
  { id: 6, name: "HP Elitebook", price: "90.000Cfa", qty: 5, img: dell },
];

const ProductTable = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm w-full md:w-3/4 overflow-hidden">
      <h2 className="font-semibold mb-4 text-gray-700">Tous Les Produits</h2>

      {/* --- Table responsive container --- */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-[600px] w-full text-sm text-left border-collapse">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-2 px-2 md:px-4">Image</th>
              <th className="py-2 px-2 md:px-4">Nom</th>
              <th className="py-2 px-2 md:px-4">Prix</th>
              <th className="py-2 px-2 md:px-4">Quantité</th>
              <th className="py-2 px-2 md:px-4">Modifier</th>
              <th className="py-2 px-2 md:px-4">Supprimer</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-2 px-2 md:px-4">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover my-1"
                  />
                </td>
                <td className="py-2 px-2 md:px-4 whitespace-nowrap text-gray-700">
                  {p.name}
                </td>
                <td className="py-2 px-2 md:px-4 whitespace-nowrap text-gray-700">
                  {p.price}
                </td>
                <td className="py-2 px-2 md:px-4">{p.qty}</td>
                <td className="py-2 px-2 md:px-4">
                  <Plus className="text-[#00A9DC] cursor-pointer" size={18} />
                </td>
                <td className="py-2 px-2 md:px-4">
                  <Trash2 className="text-red-500 cursor-pointer" size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className="px-3 py-1 bg-white border rounded-full hover:bg-blue-100 text-sm"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
