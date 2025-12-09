// src/components/ContactSection.tsx
import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { sendContactMessage } from "../hooks/useFetchQuery";
import profil from "../assets/images/logo1.webp";

type ContactSectionProps = { id?: string };

const ContactSection: React.FC<ContactSectionProps> = ({ id }) => {
  const { t } = useTranslation();

  // champs
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");

  // états UI
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);

    if (!nom.trim() || !email.trim() || !sujet.trim() || !message.trim()) {
      setErr("Veuillez remplir nom, email, sujet et message.");
      return;
    }

    setSubmitting(true);
    try {
      await sendContactMessage({
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim() || undefined,
        sujet: sujet.trim(),
        message: message.trim(),
      });
      setOk("Message envoyé avec succès.");
      setNom("");
      setEmail("");
      setTelephone("");
      setSujet("");
      setMessage("");
    } catch (e: any) {
      setErr(e?.message || "Erreur lors de l’envoi du message.");
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 80 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <motion.section
      id={id}
      className="bg-[#EAF4FB] py-10 px-6 md:px-10 lg:rounded-2xl shadow-md max-w-5xl mx-auto my-5 md:my-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
    >
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* gauche : infos */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <p className="text-gray-700 leading-relaxed max-w-sm">
          {t("com.con")  || "Laissez-nous un message et nous vous répondrons rapidement."}
          </p>

          <img
            src={profil}
            width={300}
                      height={300}
            alt="Profil"
            loading="lazy"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />

          <div className="space-y-3 text-gray-600">
  <div className="flex items-center justify-center md:justify-start gap-3">
    <Mail className="text-gray-400" size={18} />
    <span className="text-sm">info@christland.tech</span>
  </div>

  <div className="flex items-center justify-center md:justify-start gap-3">
    <Phone className="text-gray-400" size={18} />
    <span className="text-sm">691 554 641</span>
  </div>

  <div className="flex items-center justify-center md:justify-start gap-3">
    <Phone className="text-gray-400" size={18} />
    <span className="text-sm">676 089 671</span>
  </div>

  {/* ✅ Ligne ville + icône */}
  <div className="flex items-center justify-center md:justify-start gap-3">
    <MapPin className="text-gray-400" size={18} />
    <span className="text-sm"> Yaoundé, Cameroun</span>
  </div>
</div>

        </div>

        {/* droite : formulaire */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {t("form.description")  || "Contactez-nous"}
          </h2>

          {ok && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-green-700 text-sm">
              {ok}
            </div>
          )}
          {err && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
              {err}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t("name.input") || "Nom"}</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t("email.input") || "Email"}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t("phone.input") || "Téléphone (optionnel)"}</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A9DC]"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t("subject.input") || "Sujet"}</label>
              <input
                type="text"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t("message.input") || "Message"}</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A9DC] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`bg-[#00A9DC] hover:bg-sky-600 text-white font-medium px-6 py-2 rounded-full shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {submitting ? (t("form.button") || "Envoi…") : (t("form.button") || "Envoyer")}
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactSection;
