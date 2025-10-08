import React, { useState } from "react";
import logo from "../assets/images/logo.jpg";
import { Link, useNavigate } from 'react-router-dom';
import eyes from "../assets/images/eyes-open.png";
import eye from "../assets/images/eyes-off.png";
import { useTranslation } from "react-i18next";

const Connexion: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password == null) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    alert("Compte créé avec succès !");
  };

  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <div className="bg-white w-[90%] sm:w-[400px] md:w-[500px] mx-auto mt-[8%] p-8 rounded-xl shadow-lg shadow-slate-500 border border-gray-200">
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-5">
        {/* Logo */}
        <Link to="/" className="flex items-center min-w-0 p-5">
              <div className="h-10 md:h-20 w-10 md:w-20 rounded-full bg-white/10 ring-1 ring-white/10 overflow-hidden">
                <img
                  src={logo}
                  alt="CHRISTLAND TECH"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="leading-5 whitespace-nowrap">
                <span className="font-semibold tracking-wide text-[13px] sm:text-sm md:text-lg">CHRISTLAND</span>{" "}
                <span className="font-extrabold text-[#00A8E8] text-[13px] sm:text-sm md:text-lg">TECH</span>
              </div>
        </Link>

        {/* Email */}
        <div className="w-full">
          <label className="block mb-1 text-gray-700">{t('email.input')} <span className="text-red-500 font-bold">*</span></label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#00A9DC] bg-opacity-[8%] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00A9DC]"
          />
        </div>

        {/* Mot de passe */}
        <div className="w-full relative pb-5 md:pb-10">
          <label className="block mb-1 text-gray-700">{t('password.input')} <span className="text-red-500 font-bold">*</span></label>
          <input
            required
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#00A9DC] bg-opacity-[8%] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00A9DC]"
          />
          <button
            type="button"
            className="absolute right-4 top-9 text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            <img src={showPassword ? eyes : eye} alt="toggle password" className="h-5 w-5" />
          </button>
        </div>

        {/* Bouton */}
        <button
          type="submit"
          className="bg-[#00A9DC] text-white font-semibold w-full rounded-full py-2 hover:bg-sky-600 transition"
        >
          {t('form.button2')}
        </button>

        {/* Lien connexion */}
        <p className="text-sm pt-2 md:pt-5">
          {t('compte.desc2')}{" "}
          <span onClick={() => navigate('/Création-compte')} className="text-[#00A9DC] font-semibold cursor-pointer">{t('compte.desc3')}</span>
        </p>
      </form>
    </div>
  );
}

export default Connexion