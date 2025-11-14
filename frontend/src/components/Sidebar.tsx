import { useState } from "react";
import {
  Home,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus,
} from "lucide-react";
import logo from "../assets/images/logo1.png";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../auth";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const itemCls = (active: boolean) =>
    `cursor-pointer transition ${
      active ? "text-white" : "text-gray-300 hover:text-white"
    }`;

  return (
    <>
      {/* 🔹 Bouton Burger (mobile) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="bg-black text-white p-2 rounded-lg focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 🔹 Sidebar */}
      <div
        className={`bg-black text-white w-16 md:w-20 flex flex-col justify-between items-center py-6 space-y-8 rounded-3xl h-[91vh] transition-transform duration-300 z-40 
        ${open ? "translate-x-0 fixed top-14" : "-translate-x-full md:translate-x-0 fixed md:static left-0"}
      `}
      >
        <div className="flex flex-col items-center gap-20">
          {/* Logo */}
          <div className="w-10 h-10">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>

          {/* Menu navigation */}
          <nav className="flex flex-col gap-8">
            {/* ✅ Chaque icône est dans un div qui porte title et aria-label */}
            <div
              title="Tableau de bord"
              aria-label="Tableau de bord"
              onClick={() => navigate("/Dashboard")}
              className={itemCls(pathname === "/Dashboard")}
            >
              <Home size={22} />
            </div>

            <div
              title="Statistiques"
              aria-label="Statistiques"
              onClick={() => navigate("/Dashboard")}
              className={itemCls(pathname.startsWith("/Dashboard/stats"))}
            >
              <BarChart2 size={22} />
            </div>

            <div
              title="Paramètres"
              aria-label="Paramètres"
              onClick={() => navigate("/Dashboard")}
              className={itemCls(pathname.startsWith("/Dashboard/settings"))}
            >
              <Settings size={22} />
            </div>

            {/* ✅ Icône d’inscription */}
            <div
              title="Créer un compte"
              aria-label="Créer un compte"
              onClick={() => navigate("/Dashboard/Sighup")}
              className={itemCls(pathname === "/Dashboard/Sighup")}
            >
              <UserPlus size={22} />
            </div>
          </nav>
        </div>

        {/* Bouton logout */}
        <div
  role="button"
  title="Se déconnecter"
  aria-label="Se déconnecter"
  tabIndex={0}
  className="text-gray-300 hover:text-white cursor-pointer focus:outline-none"
  onClick={() => auth.logout()}                // ✅ déconnecte + redirige /Connexion
  onKeyDown={(e) => e.key === "Enter" && auth.logout()}
>
  <LogOut size={22} />
</div>
      </div>

      {/* 🔹 Overlay */}
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
