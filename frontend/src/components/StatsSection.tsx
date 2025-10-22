import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { FaUsers, FaGlobe, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const StatsSection: React.FC = () => {
  const stats = [
    {
      id: 1,
      icon: <FaUsers className="text-5xl text-[#00A9DC]" />,
      number: 100,
      suffix: "+",
      label: "stat.client",
    },
    {
      id: 2,
      icon: <FaGlobe className="text-5xl text-[#00A9DC]" />,
      number: 5,
      suffix: " ans",
      label: "stat.exp",
    },
    {
      id: 3,
      icon: <FaShoppingCart className="text-5xl text-[#00A9DC]" />,
      number: 1000,
      suffix: "+",
      label: "stat.commande",
    },
  ];

  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  const { t } = useTranslation();

  const itemVariants: Variants = {
      hidden: { opacity: 0, x: -100 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    };

  return (
    <div
      ref={ref}
      className="w-full py-12 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
        {stats.map((item) => (
          <motion.div
            key={item.id}
            className="flex flex-col items-center gap-3 bg-gray-50 rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
          >
            <div className="p-4 bg-[#E5F7FF] rounded-full">{item.icon}</div>

            <h3 className="text-3xl font-extrabold text-[#00A9DC]">
              {inView ? (
                <CountUp
                  start={0}
                  end={item.number}
                  duration={2}
                  separator=" "
                />
              ) : (
                0
              )}
              {item.suffix}
            </h3>

            <p className="text-gray-700 text-lg font-semibold">{t(item.label)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
