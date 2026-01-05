
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../auth"; // adapte le chemin

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loc = useLocation();
  if (!auth.isLoggedIn()) {
    // on se souvient d'où on vient pour revenir après login
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/dashboard/connexion?next=${next}`} replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;
