
import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BannerProps = {
  label: string;
};

const Banner: React.FC<BannerProps> = ({ label }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#DEDBDB] bg-opacity-[65%] p-5 md:p-8 mt-5 lg:mt-10 rounded-xl">
      <div
        onClick={() => navigate("/dashboard")}
        className="flex justify-center md:justify-start items-center gap-5 cursor-pointer"
      >
        <div className="flex items-center gap-2 font-bold">
          <Home />
          <p className="hidden md:block">Accueil</p>
        </div>
        <span className="font-bold">&gt;&gt;</span>
        <p className="font-bold">{label}</p>
      </div>
    </div>
  );
};

export default Banner;
