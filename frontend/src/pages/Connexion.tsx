// src/pages/Connexion.tsx
import React, { useState } from "react";
import logo from "../assets/images/logo.webp";
import { Link, useNavigate, useLocation } from "react-router-dom";
import eyes from "../assets/images/eyes-open.webp";
import eye from "../assets/images/eyes-off.webp";
import { useTranslation } from "react-i18next";
import { loginRequest } from "../hooks/useFetchQuery";
import { auth } from "../auth";

const Connexion: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrMsg(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrMsg(null);

    try {
      const res = await loginRequest(formData.email.trim(), formData.password);
      auth.login(res.access, res.refresh, res.user);
      navigate(next, { replace: true });
    } catch (err: any) {
      setErrMsg(err?.message || "Identifiants invalides.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100svh] grid place-items-center bg-[#f6fbff] px-4 py-6">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl shadow-slate-400/30 border border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-5"
          noValidate
        >
          <Link
            to="/"
            className="flex items-center min-w-0 p-2"
            aria-label="Retour à l'accueil"
          >
            <div className="h-12 w-12 rounded-full bg-white ring-1 ring-gray-200 overflow-hidden">
              <img
                src={logo}
                alt="CHRISTLAND TECH"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            <div className="leading-5 whitespace-nowrap ml-2">
              <span className="font-semibold tracking-wide text-[14px] sm:text-[15px]">
                CHRISTLAND
              </span>{" "}
              <span className="font-extrabold text-[#00A8E8] text-[14px] sm:text-[15px]">
                TECH
              </span>
            </div>
          </Link>

          {errMsg && (
            <div
              role="alert"
              className="w-full text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              {errMsg}
            </div>
          )}

          <div className="w-full">
            <label className="block mb-1 text-gray-700" htmlFor="email">
              {t("email.input")}{" "}
              <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              id="email"
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              inputMode="email"
              className="w-full bg-[#00A9DC] bg-opacity-[8%] rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#00A9DC]"
              placeholder="ex: admin@exemple.com"
            />
          </div>

          <div className="w-full relative pb-2">
            <label className="block mb-1 text-gray-700" htmlFor="password">
              {t("password.input")}{" "}
              <span className="text-red-500 font-bold">*</span>
            </label>

            <input
              id="password"
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full bg-[#00A9DC] bg-opacity-[8%] rounded-full px-4 py-2.5 pr-12 outline-none focus:ring-2 focus:ring-[#00A9DC]"
              placeholder="********"
            />

            <button
              type="button"
              aria-label={
                showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
              className="absolute right-4 top-[38px] text-gray-600"
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
            >
              <img src={showPassword ? eyes : eye} alt="" className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#00A9DC] text-white font-semibold w-full rounded-full py-2.5 hover:bg-sky-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Connexion..." : t("form.button2")}
          </button>

          <p className="text-sm pt-2">
            {t("compte.desc2")}{" "}
            <Link
              to="/dashboard/inscription"
              className="text-[#00A9DC] font-semibold underline-offset-2 hover:underline"
            >
              {t("compte.desc3")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Connexion;
