import React, { useRef } from "react";
import Slider from "react-slick";
import { motion, useInView } from "framer-motion";
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

  // 👇 Framer Motion setup
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  return (
    <div className="bg-white py-10" ref={ref}>
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold">{t("categorie")}</h2>
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
        </motion.div>

        {/* Carousel */}
        <Slider ref={sliderRef} {...settings}>
          {categories.map((cat, i) => (
            <div key={cat.id} className="px-3">
              <motion.div
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center py-8 relative"
              >
                <motion.img
                  src={cat.image}
                  alt={cat.name}
                  className="w-28 h-28 object-contain mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: i * 0.25 }}
                />
                <p className="text-lg font-medium mt-4">{cat.name}</p>
              </motion.div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CategoriesCarousel;
