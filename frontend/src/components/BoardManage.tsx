import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaLinkedinIn, FaTwitter, FaFacebookF } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import team1 from "../assets/images/team.webp";
import team2 from "../assets/images/team1.webp";
import team3 from "../assets/images/team2.webp";
import { motion } from "framer-motion";

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
  ];

  return (
    <section
      aria-labelledby="team-heading"
      className="w-full"
    >
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-8">
        {/* TITRE + DESCRIPTION */}
        <div className="text-center">
          <motion.h2
            id="team-heading"
            className="font-semibold text-center text-md md:text-lg lg:text-xl xl:text-2xl pb-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t("team")}
          </motion.h2>

          <motion.p
            className="text-[#5A5C62] w-full max-w-2xl mx-auto text-sm md:text-base"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t("team.des")}
          </motion.p>

          {/* CTA vers services : bouton accessible */}
          <motion.div
            className="pt-4 md:pt-5 flex items-center justify-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.button
              type="button"
              onClick={() => navigate("/Services")}
              className="inline-flex items-center justify-center gap-2 cursor-pointer relative group text-[#5A5C62] text-sm md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9DC] focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-md px-1"
              aria-label={t("team.contact") || "Nous contacter pour vos projets"}
            >
              <span className="text-center">
                {t("team.contact")}
              </span>
              <FaArrowRight className="text-md" aria-hidden="true" />
              <span
                className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#00A9DC] transition-all duration-500 group-hover:w-[32%] md:group-hover:w-[17%] lg:group-hover:w-[12%] xl:group-hover:w-[10%]"
                aria-hidden="true"
              />
            </motion.button>
          </motion.div>
        </div>

        {/* GRILLE TEAM */}
        <div className="pt-10 md:pt-20">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center"
            role="list"
            aria-label={t("team") || "Membres de l'équipe"}
          >
            {team.map((data) => (
              <motion.article
                key={data.id}
                role="listitem"
                aria-labelledby={`member-${data.id}`}
                className="relative w-full max-w-xs"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* IMAGE */}
                <div className="w-full">
                  <img
                    src={data.image}
                    width={300}
                    height={300}
                    alt={data.name}
                    loading="lazy"
                    className="w-full h-auto rounded-lg object-cover shadow-md hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* CARTE INFO (plus stable sur mobile) */}
                <div
                  className={`mt-4 md:-mt-10 lg:-mt-12 xl:-mt-14 ${data.color} bg-opacity-80 backdrop-blur-sm p-4 rounded-md shadow-lg w-full`}
                >
                  <h3
                    id={`member-${data.id}`}
                    className="text-base md:text-lg font-semibold text-gray-900"
                  >
                    {data.name}
                  </h3>
                  <p className="text-[#00A9DC] text-xs md:text-sm font-medium mt-0.5">
                    {data.role}
                  </p>
                  <p className="text-gray-600 text-xs md:text-sm mt-2 leading-relaxed">
                    {data.desc}
                  </p>

                  {/* RÉSEAUX SOCIAUX */}
                  <div className="flex items-center gap-4 mt-4 text-gray-500">
                    <button
                      type="button"
                      className="hover:text-[#00A9DC] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9DC] focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full p-1"
                      aria-label={`${data.name} sur LinkedIn`}
                    >
                      <FaLinkedinIn aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="hover:text-[#00A9DC] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9DC] focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full p-1"
                      aria-label={`${data.name} sur X (Twitter)`}
                    >
                      <FaTwitter aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="hover:text-[#00A9DC] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9DC] focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full p-1"
                      aria-label={`${data.name} sur Facebook`}
                    >
                      <FaFacebookF aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardManage;
