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
import logo from "../assets/images/logo1.webp";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../auth";

const GA_URL =
  "https://analytics.google.com/analytics/web/?authuser=0#/p377242813";

const GOS_URL =
  "https://search.google.com/search-console?resource_id=sc-domain%3Achristland.tech";



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
    setOpen(false);
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="w-10 h-10" aria-hidden="true">
        <img
          src={logo}
          alt="Christland Tech"
          loading="lazy"
          width={300}
          height={300}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Liens */}
      <nav
        className="flex flex-col gap-8 mt-16"
        aria-label="Navigation tableau de bord"
      >
        <button
          type="button"
          title="Tableau de bord"
          aria-label="Tableau de bord"
          aria-current={pathname === "/dashboard" ? "page" : undefined}
          onClick={() => go("/dashboard")}
          className={itemCls(pathname === "/dashboard")}
        >
          <Home size={22} aria-hidden="true" />
        </button>

        <button
          type="button"
          title="Statistiques"
          aria-label="Statistiques Google Analytics"
          onClick={() =>
            window.open(GA_URL, "_blank", "noopener,noreferrer")
          }
          className={itemCls(false)}
        >
          <BarChart2 size={22} aria-hidden="true" />
        </button>

        <button
          type="button"
          title="Paramètres"
          aria-label="Paramètres"
           onClick={() =>
            window.open(GOS_URL, "_blank", "noopener,noreferrer")
          }
          className={itemCls(false)}
        >
          <Settings size={22} aria-hidden="true" />
        </button>

        <button
          type="button"
          title="Créer un compte"
          aria-label="Créer un compte"
          aria-current={
            pathname === "/dashboard/Sighup" ? "page" : undefined
          }
          onClick={() => go("/dashboard/Sighup")}
          className={itemCls(pathname === "/dashboard/Sighup")}
        >
          <UserPlus size={22} aria-hidden="true" />
        </button>
      </nav>

      {/* Logout */}
      <button
        type="button"
        title="Se déconnecter"
        aria-label="Se déconnecter"
        className="text-gray-300 hover:text-white cursor-pointer focus:outline-none mt-auto"
        onClick={() => auth.logout()}
      >
        <LogOut size={22} aria-hidden="true" />
      </button>
    </>
  );

  return (
    <>
      {/* MOBILE */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="absolute top-4 left-4 z-50 bg-black text-white p-2 rounded-lg focus:outline-none flex items-center gap-2"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="dashboard-sidebar-mobile"
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        {open && (
          <div
            id="dashboard-sidebar-mobile"
            className="absolute top-16 left-3 right-3 z-40"
          >
            <div className="bg-black text-white rounded-3xl py-4 flex flex-col items-center">
              <NavContent />
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP / TABLETTE */}
      <div className="hidden md:block w-20" aria-hidden="true" />

      <div className="hidden md:block" aria-label="Barre latérale">
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
