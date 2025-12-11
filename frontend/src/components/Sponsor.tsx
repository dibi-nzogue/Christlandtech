// src/components/Sponsor.tsx
import React, { useRef } from "react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderPlugin } from "keen-slider/react";
import { motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import "keen-slider/keen-slider.min.css";

import hp from "../assets/images/Logos/hp.webp";
import apple from "../assets/images/Logos/apple.webp";
import lenovo from "../assets/images/Logos/lenovo.webp";
import canon from "../assets/images/Logos/canon.webp";
import android from "../assets/images/Logos/android.webp";

const logos = [
  { src: hp, alt: "Logo HP" },
  { src: apple, alt: "Logo Apple" },
  { src: lenovo, alt: "Logo Lenovo" },
  { src: canon, alt: "Logo Canon" },
  { src: android, alt: "Logo Android" },
];

/** 🔁 Plugin autoplay pour Keen Slider */
const autoplayPlugin: KeenSliderPlugin = (slider) => {
  let timeout: ReturnType<typeof setTimeout>;
  let mouseOver = false;

  function clearNextTimeout() {
    clearTimeout(timeout);
  }

  function nextTimeout() {
    clearTimeout(timeout);
    if (!mouseOver) {
      timeout = setTimeout(() => {
        slider.next();
      }, 3000);
    }
  }

  slider.on("created", () => {
    slider.container.addEventListener("mouseover", () => {
      mouseOver = true;
      clearNextTimeout();
    });
    slider.container.addEventListener("mouseout", () => {
      mouseOver = false;
      nextTimeout();
    });
    nextTimeout();
  });

  slider.on("dragStarted", clearNextTimeout);
  slider.on("animationEnded", nextTimeout);
  slider.on("updated", nextTimeout);
};

const Sponsor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      renderMode: "performance",
      slides: {
        perView: 3,
        spacing: 16,
      },
      breakpoints: {
        "(max-width: 768px)": {
          slides: { perView: 3, spacing: 8 },
        },
        "(max-width: 480px)": {
          slides: { perView: 2, spacing: 8 },
        },
      },
    },
    [autoplayPlugin]
  );

  return (
    <section
      ref={containerRef}
      className="bg-[#C5BFBF]/50 py-4 md:py-6 lg:py-8 my-5 md:my-10 lg:my-16"
      aria-label="Marques et partenaires Christland Tech"
    >
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        {/* Desktop : liste de logos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="hidden lg:flex justify-between items-center"
          role="list"
        >
          {logos.map((logo, index) => (
            <motion.img
              key={index}
              loading="lazy"
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={50}
              className="h-[50px] w-auto object-contain"
              variants={itemVariants}
              decoding="async"
            />
          ))}
        </motion.div>

        {/* Mobile (Keen Slider) */}
        <div className="lg:hidden">
          <div
            ref={sliderRef}
            className="keen-slider"
            aria-roledescription="carousel"
            aria-label="Logos des partenaires"
          >
            {logos.map((logo, index) => (
              <div
                key={index}
                className="keen-slider__slide flex justify-center items-center"
                role="group"
                aria-label={`${index + 1} sur ${logos.length}`}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  width={120}
                  height={50}
                  className="w-[40%] h-[50px] object-contain mx-auto"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sponsor;
