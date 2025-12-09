import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa6";
import logo from "../assets/images/logo.webp";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {

    const { t } = useTranslation();

  const footerLinks = [
    { key: "Accueil", to: "/" },
    { key: "A propos", to: "/a-propos" },
    { key: "Produits", to: "/Produits" },
    { key: "Services", to: "/Services" },
    { key: "Assistance", to: "/Assistance" },
  ];


  return (
    <footer className="bg-[#f5f5f5] text-gray-500 pt-10 pb-5 px-6 md:px-16">
      {/* --- Haut du footer --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-4 min-w-0">
              <div className="h-10 md:h-16 w-10 md:w-16 rounded-full bg-white/10 ring-1 ring-white/10 overflow-hidden">
                <img
                  src={logo}
                  width={300}
                      height={300}
                  alt="CHRISTLAND TECH"
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="leading-5 whitespace-nowrap">
                <span className="font-semibold tracking-wide text-[13px] sm:text-sm md:text-lg text-black">CHRISTLAND</span>{" "}
                <span className="font-extrabold text-[#00A8E8] text-[13px] sm:text-sm md:text-lg">TECH</span>
              </div>
        </Link>

        {/* Réseaux sociaux */}
        <div className="flex items-center gap-5 mt-5 md:mt-0 text-black text-lg">
          <FaXTwitter className="hover:text-[#00A9DC] transition-colors cursor-pointer" />
          <FaLinkedinIn className="hover:text-[#00A9DC] transition-colors cursor-pointer" />
          <FaFacebookF className="hover:text-[#00A9DC] transition-colors cursor-pointer" />
          <FaInstagram className="hover:text-[#00A9DC] transition-colors cursor-pointer" />
          <FaYoutube className="hover:text-[#00A9DC] transition-colors cursor-pointer" />
        </div>
      </div>

      {/* --- Contenu principal --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-10 mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        {/* Colonne 1 : Adresse */}
        <div>
          <h2 className="font-semibold text-gray-600 text-lg mb-2">
            {t('siege')}
          </h2>
          <p className="text-sm">Cameroun, Yaoundé</p>
          <p className="text-sm">Monté Jouvence</p>
        </div>

        {/* Colonne 2 : Liens */}
<div className="space-y-2">
  {footerLinks.map((link) => (
    <Link
      key={link.key}
      to={link.to}
      className="block text-sm hover:text-[#00A9DC] transition-colors"
    >
      {t(link.key)}
    </Link>
  ))}
</div>


        {/* Colonne 3 : Contact */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-gray-400" />
            <a href="mailto:info@christland.tech" className="hover:underline">info@christland.tech</a>
          </div>
          <div className="flex items-center gap-2">
            <FaPhone className="text-gray-400" />
            <a href="tel:+237691554641" className="hover:underline">691 554 641</a>
          </div>
          <div className="flex items-center gap-2">
            <FaPhone className="text-gray-400" />
            <a href="tel:+237676089671" className="hover:underline">676 089 671</a>
          </div>
        </div>

      {/* --- Bas du footer --- */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 pt-3 w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        <p>© 2025, Christland Tech</p>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
