import React, { useRef } from "react";
import Slider from "react-slick";
import { motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import hp from "../assets/images/Logos/hp.png";
import apple from "../assets/images/Logos/apple.png";
import lenovo from "../assets/images/Logos/lenovo.png";
import canon from "../assets/images/Logos/canon.png";
import android from "../assets/images/Logos/android.png";

const logos = [hp, apple, lenovo, canon, android];

const Sponsor: React.FC = () => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 3000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div
      ref={ref}
      className="bg-[#C5BFBF]/50 py-4 md:py-6 lg:py-8 my-5 md:my-10 lg:my-16"
    >
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        {/* Desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="hidden lg:flex justify-between items-center"
        >
          {logos.map((logo, index) => (
            <motion.img
              key={index}
              src={logo}
              alt={`Sponsor ${index}`}
              className="h-[50px] object-contain"
              variants={itemVariants}
            />
          ))}
        </motion.div>

        {/* Mobile */}
        <div className="lg:hidden">
          <Slider {...settings} className="mx-auto">
            {logos.map((logo, index) => (
              <div key={index} className="flex justify-between items-center">
                <img
                  src={logo}
                  alt={`Sponsor ${index}`}
                  className="w-[40%] h-[50px] object-contain mx-auto"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Sponsor;
