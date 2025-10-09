import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ServiceSection: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();

  return (
    <div className='w-full h-[50vh] md:h-[60vh] xl:h-[80vh] bg-hero-service bg-cover bg-center flex items-center justify-center my-10 md:my-20'>
        <div className='mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10'>
            <div>
                <h1 className='text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold text-white mb-4 text-center'>
                    {t('service.description')}
                </h1>
                <div
                    onClick={() => navigate("/Services")}
                    className="pt-10 md:pt-20 text-white flex items-center justify-center gap-3 md:gap-5 cursor-pointer relative group"
                >
                    <p className="font-semibold text-center text-md md:text-lg lg:text-xl xl:text-2xl">
                        {t('Services')} Christland <span className="text-[#00A9DC]">Tech</span>
                    </p>
                    <FaArrowRight className="text-[#00A9DC] text-lg md:text-xl" />
                    <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#00A9DC] transition-all duration-500 group-hover:w-[50%] md:group-hover:w-[32%] lg:group-hover:w-[30%] xl:group-hover:w-[20%]"
                    ></span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ServiceSection