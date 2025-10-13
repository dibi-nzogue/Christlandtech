import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { ArrowRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from 'react-i18next';

import lenovo from "../assets/images/lenovo.webp";
import hp from "../assets/images/hp.jpg";
import dell from "../assets/images/dell.jpg";
import asus from "../assets/images/lenovo.webp"; // ton 4e produit

type Product = {
  id: number;
  brand: string;
  name: string;
  specs: string;
  price: number;
  oldPrice?: number;
  image: string;
  state: "Neuf" | "Occasion";
  category: "Notebooks" | "Desktops" | "Iphone";
};

const products: Product[] = [
  {
    id: 1,
    brand: "Lenovo",
    name: "Notebook Thinkpad X13 G1",
    specs: "i5 10.Gen | 13,3” FHD | 16 GB | 256 GB | SGT",
    price: 150000,
    image: lenovo,
    state: "Neuf",
    category: "Notebooks",
  },
  {
    id: 2,
    brand: "HP",
    name: "Laptop Elitebook 830 G6",
    specs: "i5 8.Gen | 13,3” FHD | 8 GB | 256 GB | GUT",
    price: 120000,
    oldPrice: 150000,
    image: hp,
    state: "Occasion",
    category: "Notebooks",
  },
  {
    id: 3,
    brand: "Dell",
    name: "Notebook Latitude 5300",
    specs: "i5 8.Gen | 13,3” FHD | 16 GB | 256 GB | GUT",
    price: 150000,
    image: dell,
    state: "Neuf",
    category: "Notebooks",
  },
  {
    id: 4,
    brand: "Asus",
    name: "Notebook Zenbook 14",
    specs: "i7 11.Gen | 14” FHD | 16 GB | 512 GB | SSD",
    price: 180000,
    image: asus,
    state: "Neuf",
    category: "Notebooks",
  },
  {
    id: 5,
    brand: "Apple",
    name: "iPhone 13 Pro Max",
    specs: "128 GB | 6.7” | 12 MP",
    price: 650000,
    image: "https://via.placeholder.com/250x160?text=iPhone+13+Pro+Max",
    state: "Neuf",
    category: "Iphone",
  },
];

// Flèches personnalisées du carrousel
const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-5 cursor-pointer hover:bg-gray-100 transition"
      onClick={onClick}
    >
      <ArrowRight size={18} className="text-gray-700" />
    </div>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 -left-5 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-5 cursor-pointer hover:bg-gray-100 transition rotate-180"
      onClick={onClick}
    >
      <ArrowRight size={18} className="text-gray-700" />
    </div>
  );
};

export default function Nouveautes() {
  const [activeTab, setActiveTab] = useState<"Notebooks" | "Desktops" | "Iphone">("Notebooks");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const filteredProducts = products.filter((p) => p.category === activeTab);

  const settings = {
    dots: false,
    infinite: filteredProducts.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "60px", 
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, centerPadding: "50px" },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, centerPadding: "40px" },
      },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 flex flex-col items-center py-10 bg-white">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">{t('new')}</h2>

      {/* Onglets */}
      <div className="flex space-x-6 mb-10">
        {(["Notebooks", "Desktops", "Iphone"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              activeTab === tab
                ? "bg-gray-200 text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Carrousel Slick */}
      <div className="relative w-full mb-10">
        <Slider {...settings}>
          {filteredProducts.map((p) => (
            <div key={p.id} className="px-3">
              <div className="relative bg-white shadow-md rounded-2xl my-5 p-4 flex flex-col justify-between items-start gap-5 md:gap-8 hover:shadow-lg transition-shadow">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-60 object-cover w-full mb-4 rounded-2xl"
                />
                <h4 className="text-sm text-gray-500">{p.brand}</h4>
                <div>
                  <p className="font-semibold text-gray-800">{p.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{p.specs}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {p.oldPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      Fcfa {p.oldPrice}
                    </span>
                  )}
                  <span className="font-bold text-gray-900">Fcfa {p.price}</span>
                </div>

                <div className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl text-sm font-medium w-full text-center">
                  État: {p.state}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Bouton */}
      <button
        onClick={() => navigate("/Produits")}
        className="bg-[#00A9DC] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-sky-600 transition-colors mt-10"
      >
        {t('pdt')}
      </button>
    </div>
  );
}
