import React from "react";
import { Mail, Phone } from "lucide-react";
import profil from '../assets/images/profil.png'
import { useTranslation } from "react-i18next";

type ContactSectionProps = {
  id?: string;
};

const ContactSection: React.FC<ContactSectionProps> = ({ id }) => {

  const { t } = useTranslation();

  return (
    <section className="bg-[#EAF4FB] py-10 px-6 md:px-10 lg:rounded-2xl shadow-md max-w-5xl mx-auto my-5 md:my-10" id={id}>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Partie gauche */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <p className="text-gray-700 leading-relaxed max-w-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
            exercitationem aut, velit voluptas eligendi commodi ipsa possimus.
          </p>

          <img
            src={profil}// remplace par ton image
            alt="Photo de profil"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />

          <div className="space-y-3 text-gray-600">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Mail className="text-gray-400" size={18} />
              <span className="text-sm">info@christland.product.tech</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Phone className="text-gray-400" size={18} />
              <span className="text-sm">691 554 641</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Phone className="text-gray-400" size={18} />
              <span className="text-sm">676 089 671</span>
            </div>
          </div>
        </div>

        {/* Partie droite */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {t('form.description')}
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t('name.input')}</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t('email.input')}</label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                {t('phone.input')}
              </label>
              <input
                type="tel"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A9DC]"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                {t('message.input')}
              </label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A9DC] resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-[#00A9DC] hover:bg-sky-600 text-white font-medium px-6 py-2 rounded-full shadow transition-all duration-200"
            >
              {t('form.button')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
