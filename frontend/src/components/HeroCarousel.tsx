import React, { useRef } from "react";
import Slider from "react-slick";
import { motion, useInView } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import hero from "../assets/images/hero.png";
import hero1 from "../assets/images/hero1.png";
import hero2 from "../assets/images/hero2.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "hero.title",
    highlighted: "highlighted",
    description: "hero.description",
    button: "hero.button",
    image: hero,
  },
  {
    title: "hero.title",
    highlighted: "highlighted",
    description: "hero.description",
    button: "hero.button",
    image: hero1,
  },
  {
    title: "hero.title",
    highlighted: "highlighted",
    description: "hero.description",
    button: "hero.button",
    image: hero2,
  },
];

const NextArrow = ({ onClick }: any) => (
  <div
    className="absolute right-5 top-2/3 md:top-1/2 z-10 cursor-pointer bg-white rounded-full p-2 lg:p-3 text-gray-900 text-sm md:text-md"
    onClick={onClick}
  >
    <FaArrowRight />
  </div>
);

const PrevArrow = ({ onClick }: any) => (
  <div
    className="absolute left-5 top-2/3 md:top-1/2 z-10 cursor-pointer bg-white rounded-full p-2 lg:p-3 text-gray-900 text-sm md:text-md"
    onClick={onClick}
  >
    <FaArrowLeft />
  </div>
);

const HeroCarousel: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: true,
    autoplaySpeed: 5000,
    appendDots: (dots: any) => (
      <div style={{ bottom: "10px" }}>
        <ul className="custom-dots"> {dots} </ul>
      </div>
    ),
  };

  return (
    <div ref={ref}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="relative px-2">
            <img
              src={slide.image}
              alt={slide.title}
              loading="lazy"
              className="w-full h-[60vh] md:h-[70vh] object-cover rounded-2xl"
            />

            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 gap-4 md:gap-10 lg:gap-16">
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold text-white mb-4"
              >
                {t(slide.title)}
                <span className="text-[#00A9DC]"> {t(slide.highlighted)}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-white/90 max-w-xl mb-6 text-md md:text-lg lg:text-xl"
              >
                {t(slide.description)}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                onClick={() => navigate("/produits")}
                className="bg-[#00A9DC] text-white px-2 md:px-4 py-1 md:py-2 rounded-md text-md md:text-lg"
              >
                {t(slide.button)}
              </motion.button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroCarousel;
