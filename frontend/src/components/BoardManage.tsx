import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { FaLinkedinIn, FaTwitter, FaFacebookF } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import team1 from '../assets/images/team.png';
import team2 from '../assets/images/team1.png';
import team3 from '../assets/images/team2.png';
import { motion } from 'framer-motion';

const BoardManage: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const team = [
        {
            id: 1,
            image: team1,
            name: "Nzoba Rachel",
            role: "Fondatrice",
            desc: "Enjoys adventurous travel, seeks new cultures and offbeat destinations.",
            color: "bg-[#FFE5E0]",
        },
        {
            id: 2,
            image: team2,
            name: "Franck Kamdem",
            role: "Chef de Projet",
            desc: "Enjoys adventurous travel, seeks new cultures and offbeat destinations.",
            color: "bg-[#E3EFFF]",
        },
        {
            id: 3,
            image: team3,
            name: "Pouekoua Wilfried",
            role: "Directeur Technique",
            desc: "Enjoys adventurous travel, seeks new cultures and offbeat destinations.",
            color: "bg-[#E0F4FF]",
        },
        {
            id: 4,
            image: team1,
            name: "Nzoba Rachel",
            role: "Fondatrice",
            desc: "Enjoys adventurous travel, seeks new cultures and offbeat destinations.",
            color: "bg-[#FFE5E0]",
        },
    ]

  return (
    <div>
        <div className='mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8'>
            <div className='text-center'>
                <motion.p className='font-semibold text-center text-md md:text-lg lg:text-xl xl:text-2xl pb-4' initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    {t('team')}
                </motion.p>
                <motion.p className='text-[#5A5C62] w-[80%] lg:w-[50%] mx-auto' initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                   {t('team.des')}
                </motion.p>
                <motion.div
                    onClick={() => navigate("/Services")}
                    className="pt-4 md:pt-5 flex items-center justify-center gap-2 cursor-pointer relative group text-[#5A5C62]" initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <p className="text-center">
                        {t('team.contact')}
                    </p>
                    <FaArrowRight className="text-md" />
                    <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#00A9DC] transition-all duration-500 group-hover:w-[32%] md:group-hover:w-[17%] lg:group-hover:w-[12%] xl:group-hover:w-[10%]"
                    >
                    </span>
                </motion.div>
            </div>
            <div className="pt-10 md:pt-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center rounded-xl">
                    {team.map((data) => (
                        <motion.div initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <div key={data.id} className="w-full max-w-xs relative">
                                <img
                                src={data.image}
                                alt=""
                                className="w-full h-auto rounded-lg object-cover shadow-md hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className='bg-white p-3 rounded-md absolute -mt-48 md:-mt-48 lg:-mt-52 h-auto md:h-[200px] w-[300px] md:w-[255px] lg:w-[220px] xl:w-[300px] mx-2'>
                                <h3 className="text-lg font-semibold">{data.name}</h3>
                                <p className="text-[#00A9DC] text-sm font-medium">
                                    {data.role}
                                </p>
                                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                    {data.desc}
                                </p>
                                <div className="flex items-center gap-4 mt-4 text-gray-500">
                                    <FaLinkedinIn className="hover:text-[#00A9DC] cursor-pointer" />
                                    <FaTwitter className="hover:text-[#00A9DC] cursor-pointer" />
                                    <FaFacebookF className="hover:text-[#00A9DC] cursor-pointer" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default BoardManage