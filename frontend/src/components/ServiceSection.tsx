
import React, { useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";

import heroServiceBg from "../assets/images/hero3.webp";

const ServiceSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="w-full h-[50vh] md:h-[60vh] xl:h-[80vh] bg-cover bg-center flex items-center justify-center my-10 md:my-20"
      style={{
        backgroundImage: `url(${heroServiceBg})`,
      }}
      aria-labelledby="services-hero-title"
    >
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 text-center">
        <motion.h1
          id="services-hero-title"
          className="text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {t("service.description")}
        </motion.h1>

        <motion.button
          type="button"
          onClick={() => navigate("/services")}
          className="pt-10 md:pt-20 text-white flex items-center justify-center gap-3 md:gap-5 cursor-pointer relative group mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          aria-label={t("Services") + " Christland Tech"}
        >
          <p className="font-semibold text-md md:text-lg lg:text-xl xl:text-2xl">
            {t("Services")} Christland{" "}
            <span className="text-[#00A9DC]">Tech</span>
          </p>
          <FaArrowRight className="text-[#00A9DC] text-lg md:text-xl" aria-hidden="true" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#00A9DC] transition-all duration-500 group-hover:w-[50%] md:group-hover:w-[32%] lg:group-hover:w-[30%] xl:group-hover:w-[20%]" />
        </motion.button>
      </div>
    </section>
  );
};

export default ServiceSection;
