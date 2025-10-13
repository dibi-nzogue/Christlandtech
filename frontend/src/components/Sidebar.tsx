import { useState } from "react";
import { Home, BarChart2, Settings, LogOut, Menu, X } from "lucide-react";
import logo from "../assets/images/logo1.png";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 🔹 Bouton Burger (visible seulement sur mobile) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="bg-black text-white p-2 rounded-lg focus:outline-none"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 🔹 Sidebar principale */}
      <div
        className={`bg-black text-white w-16 md:w-20 flex flex-col justify-between items-center py-6 space-y-8 rounded-3xl h-[91vh] transition-transform duration-300 z-40 
        ${open ? "translate-x-0 fixed top-14" : "-translate-x-full md:translate-x-0 fixed md:static left-0"}
      `}
      >
        <div className="flex flex-col items-center gap-20">
          {/* Logo */}
          <div className="text-3xl font-bold w-10 h-10">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>

          {/* Menu navigation */}
          <nav className="flex flex-col gap-10 text-gray-300">
            <Home className="hover:text-white cursor-pointer" size={22} />
            <BarChart2 className="hover:text-white cursor-pointer" size={22} />
            <Settings className="hover:text-white cursor-pointer" size={22} />
          </nav>
        </div>

        {/* Bouton logout */}
        <div>
          <LogOut className="hover:text-white cursor-pointer" size={22} />
        </div>
      </div>

      {/* 🔹 Overlay sombre (clic en dehors ferme le menu) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
