import React from "react";
import Slider from "react-slick";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import laptop from "../assets/images/laptop.png";
import phone from "../assets/images/phone.png";
import ps from "../assets/images/playstation.png";
import camera from "../assets/images/camera.png";

const CategoriesCarousel: React.FC = () => {
  const categories = [
    { id: 1, name: "Ordinateurs", image: laptop },
    { id: 2, name: "Téléphones", image: phone },
    { id: 3, name: "Playstations", image: ps },
    { id: 4, name: "Caméras", image: camera },
  ];

  const sliderRef = React.useRef<Slider | null>(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const { t } = useTranslation();

  return (
    <div className="bg-white py-10">
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold">{t('categorie')}</h2>
          <div className="flex gap-3">
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <Slider ref={sliderRef} {...settings}>
          {categories.map((cat) => (
            <div key={cat.id} className="px-3">
                <div className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center py-8 relative">
                    <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-28 h-28 object-contain mb-4"
                    />
                    <p className="text-lg font-medium mt-4">{cat.name}</p>
                </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CategoriesCarousel;
