// src/components/Sidebar.tsx
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

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const itemCls = (active: boolean) =>
    `cursor-pointer transition ${
      active ? "text-white" : "text-gray-300 hover:text-white"
    }`;

  const go = (path: string) => {
    navigate(path);
    setOpen(false); // ferme le menu mobile
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="w-10 h-10">
        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
      </div>

      {/* Liens */}
      <nav className="flex flex-col gap-8 mt-16">
        <div
          title="Tableau de bord"
          aria-label="Tableau de bord"
          onClick={() => go("/Dashboard")}
          className={itemCls(pathname === "/Dashboard")}
        >
          <Home size={22} />
        </div>

        <div
          title="Statistiques"
          aria-label="Statistiques"
          onClick={() => go("/Dashboard")}
          className={itemCls(pathname.startsWith("/Dashboard/stats"))}
        >
          <BarChart2 size={22} />
        </div>

        <div
          title="Paramètres"
          aria-label="Paramètres"
          onClick={() => go("/Dashboard")}
          className={itemCls(pathname.startsWith("/Dashboard/settings"))}
        >
          <Settings size={22} />
        </div>

        <div
          title="Créer un compte"
          aria-label="Créer un compte"
          onClick={() => go("/Dashboard/Sighup")}
          className={itemCls(pathname === "/Dashboard/Sighup")}
        >
          <UserPlus size={22} />
        </div>
      </nav>

      {/* Logout */}
      <div
        role="button"
        title="Se déconnecter"
        aria-label="Se déconnecter"
        tabIndex={0}
        className="text-gray-300 hover:text-white cursor-pointer focus:outline-none mt-auto"
        onClick={() => auth.logout()}
        onKeyDown={(e) => e.key === "Enter" && auth.logout()}
      >
        <LogOut size={22} />
      </div>
    </>
  );

  return (
    <>
      {/* ───────── MOBILE (< md) : bouton + menu flottant, ne pousse PAS le contenu ───────── */}
      <div className="md:hidden">
        {/* Bouton burger par-dessus le header */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute top-4 left-4 z-50 bg-black text-white p-2 rounded-lg focus:outline-none flex items-center gap-2"
          aria-label="Ouvrir le menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
         
        </button>

        {/* Panel du menu : positionné en haut, par-dessus, sans prendre de place dans le flux */}
        {open && (
          <div className="absolute top-16 left-3 right-3 z-40">
            <div className="bg-black text-white rounded-3xl py-4 flex flex-col items-center gap-6">
              <NavContent />
            </div>
          </div>
        )}
      </div>

      {/* ───────── DESKTOP / TABLETTE (md+) : sidebar FIXE ───────── */}
      {/* espace réservé dans le flex pour ne pas recouvrir le contenu */}
      <div className="hidden md:block w-20" />

      {/* barre réelle, fixée à gauche */}
      <div className="hidden md:block">
        <div className="fixed top-8 left-8 z-40">
          <div className="bg-black text-white w-16 md:w-20 h-[91vh] rounded-3xl py-6 flex flex-col items-center">
            <NavContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
