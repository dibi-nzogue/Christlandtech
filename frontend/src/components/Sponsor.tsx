import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import hp from "../assets/images/Logos/hp.png";
import apple from "../assets/images/Logos/apple.png";
import lenovo from "../assets/images/Logos/lenovo.png";
import canon from "../assets/images/Logos/canon.png";
import android from "../assets/images/Logos/android.png";

const logos = [hp, apple, lenovo, canon, android];

const Sponsor: React.FC = () => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 768, // en dessous de 768px
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480, // très petit écran
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-[#C5BFBF]/50 py-4 md:py-6 lg:py-8 my-5 md:my-10 lg:my-16">
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        {/* Version desktop : grille statique */}
        <div className="hidden lg:flex justify-between items-center">
          {logos.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt={`Sponsor ${index}`}
              className=" h-[50px] object-contain"
            />
          ))}
        </div>

        {/* Version mobile : carousel */}
        <div className="lg:hidden">
          <Slider {...settings} className="mx-auto">
            {logos.map((logo, index) => (
              <div key={index} className="flex justify-between items-center">
                <img
                  src={logo}
                  alt={`Sponsor ${index}`}
                  className="w-[40%] h-[50px] object-contain mx-auto"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Sponsor;
