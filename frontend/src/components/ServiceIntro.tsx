// src/components/ServiceIntro.tsx
import React from "react";
import banner from "../assets/images/achat/07b83e0c-2d5b.webp";
import { useTranslation } from "react-i18next";




const ServiceIntro: React.FC = () => {

const { t } = useTranslation();

  return (
    <section className="bg-white ">
      {/* ===== BANNIÈRE ===== */}
      {/* Marges latérales en % pour matcher ta maquette (~3% mobile, 5% md, 8% xl) */}
      <div className="sm:mx-[2%] md:mx-[1%] lg:mx-[3%] mx-[3%] ">
        <div
          className="
            relative border border-gray-200 overflow-hidden
           aspect-[29/9] sm:aspect-[29/9] md:aspect-[29/9] lg:aspect-[32/9]  /* plus panoramique sur grand écran */
          "
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay + Titre centré */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center">
            <h1 className="text-white uppercase font-extrabold tracking-wide
                           text-xl sm:text-3xl md:text-5xl lg:text-6xl">
             {t('ser.title')} <span className="text-[#00A8E8]">{t('ser.title1')}</span>
            </h1>
          </div>
        </div>
      </div>

      {/* ===== INTRO TEXTE ===== */}
      <div className="mx-auto w-full max-w-screen-2xl  px-6 sm:px-8 lg:px-10 py-10 text-left ">
        <h3 className=" text-[15px] sm:text-[16px] md:text-[20px]  lg:text-[28px] font-semibold text-gray-900 uppercase leading-snug">
         {t('ser.ch')}
          <br />
          {t('ser.ch1')}
        </h3>
        <div className="h-[3px] w-12 bg-[#00A8E8] mt-3 mb-6" />
        <p className="text-[12px] sm:text-[14px] md:text-[18px] lg:text-[22px] text-[#00A8E8]">
         {t('ser.an')}
        </p>
      </div>
    </section>
  );
};

export default ServiceIntro;
