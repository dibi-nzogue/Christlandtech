import React from 'react'
import hero4 from '../assets/images/hero4.png';
import hero5 from '../assets/images/hero5.png';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const HeroAbout: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 80 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: "easeOut" },
        },
      };

  return (
    <div className='mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8 md:pt-28 lg:pt-32'>
        <div className=''>
            <motion.h1 className='font-extrabold text-[13px] sm:text-sm md:text-xl lg:text-2xl xl:text-4xl' variants={containerVariants} initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.6 }}>
                {t('A_propos')} CHRISTLAND <span className="text-[#00A8E8]">TECH.</span>
            </motion.h1>
            <motion.p className='pt-4 md:pt-10 font-semibold text-sm md:text-lg lg:text-xl' variants={containerVariants} initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.8 }}>
                {t('highlighted1')}: <br /> {t('highlighted2')}
            </motion.p>
        </div>
        <div className="flex justify-center items-center relative">
            {/* Image de gauche */}
            <motion.div
                className="w-1/3 hidden lg:block"
                initial={{ x: -150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <img src={hero4} alt="hero left" className="rounded-xl" />
            </motion.div>

            {/* Image de droite avec texte superposé */}
            <motion.div
                className="w-full lg:w-2/3 relative"
                initial={{ x: 150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <img src={hero5} alt="" className=" object-cover hidden lg:block" />

                {/* Texte positionné par-dessus l’image */}
                <div className="relative lg:absolute inset-0 flex flex-col justify-center gap-5 lg:gap-6 xl:gap-10 px-5 lg:px-10 py-10 lg:py-0 lg:w-[80%] bg-[#6CBAD9]/40 lg:bg-transparent mt-10 rounded-xl lg:rounded-none">
                    <h2 className="lg:text-2xl font-bold mb-4">
                        {t('about.title')}
                    </h2>
                    <p className="text-sm md:text-auto text-gray-700 leading-relaxed">
                        {t('about.description')}
                    </p>
                    <button 
                        onClick={() => navigate('/Services')}
                        className="bg-[#00A9DC] text-white px-2 md:px-4 py-1 md:py-2 rounded-md text-md md:text-lg w-[45%] md:w-[35%] lg:w-[40%] xl:w-[30%]"
                    >
                        {t('service.button')}
                    </button>
                </div>
            </motion.div>
        </div>
    </div>
  )
}

export default HeroAbout