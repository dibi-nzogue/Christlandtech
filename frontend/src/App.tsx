// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Accueil from "./pages/Accueil";
import About from "./pages/About";
import Produits from "./pages/Produits";
import Services from "./pages/Services";
import Assistance from "./pages/Assistance";
import Sighup from "./pages/Sighup";
import Connexion from "./pages/Connexion";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import AddArticle from "./pages/AddArticle";
import UpdateProduct from "./pages/UpdateProduct";
import UpdateArticle from "./pages/UpdateArticle";
import UpdateCathegorie from "./pages/UpdateCathegorie";
import AddCathegorie from "./pages/AddCathegorie";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";

// ✅ IMPORT React Query pour suivre le chargement global
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

// ✅ IMPORT du loader
import GlobalLoader from "./components/GlobalLoader";

const App: React.FC = () => {
  const { i18n } = useTranslation();

  // ✅ nombre de requêtes GET en cours
  const isFetching = useIsFetching();
  // ✅ nombre de requêtes POST/PUT/DELETE en cours (si tu en as)
  const isMutating = useIsMutating();

  // ✅ true si au moins une requête est en cours
  const isLoadingGlobal = isFetching + isMutating > 0;

  return (
    <main className="relative min-h-screen">
      {/* ✅ Loader global : s'affiche tant que la connexion travaille */}
      {isLoadingGlobal && <GlobalLoader />}
      <Routes key={i18n.language}>
        {/* === PUBLIC (chemins canoniques) === */}
        <Route path="/" element={<Accueil key={i18n.language} />} />
        <Route path="/a-propos" element={<About key={i18n.language} />} />
        <Route path="/produits" element={<Produits key={i18n.language} />} />
        <Route path="/services" element={<Services key={i18n.language} />} />
        <Route path="/assistance" element={<Assistance key={i18n.language} />} />

        {/* === AUTH (canoniques) === */}
        <Route path="/dashboard/inscription" element={<Sighup />} />
        <Route path="/dashboard/connexion" element={<Connexion />} />

        {/* === DASHBOARD PRIVÉ (canoniques) === */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard/ajouter-produit" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
        <Route path="/dashboard/ajouter-article" element={<PrivateRoute><AddArticle /></PrivateRoute>} />
        <Route path="/dashboard/modifier/:id" element={<PrivateRoute><UpdateProduct /></PrivateRoute>} />
        <Route path="/dashboard/articles/:id/edit" element={<PrivateRoute><UpdateArticle /></PrivateRoute>} />
        <Route path="/dashboard/categories/:id/edit" element={<PrivateRoute><UpdateCathegorie /></PrivateRoute>} />
        <Route path="/dashboard/ajouter-categorie" element={<PrivateRoute><AddCathegorie /></PrivateRoute>} />

        {/* === ANCIENNES ROUTES (majuscules / underscores) → REDIRECT === */}
        {/* Pages publiques anciennes */}
        <Route path="/Produits" element={<Navigate to="/produits" replace />} />
        <Route path="/Services" element={<Navigate to="/services" replace />} />
        <Route path="/Assistance" element={<Navigate to="/assistance" replace />} />

        {/* Dashboard + auth anciennes */}
        <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/Dashboard/Connexion" element={<Navigate to="/dashboard/connexion" replace />} />
        <Route path="/Dashboard/Sighup" element={<Navigate to="/dashboard/inscription" replace />} />

        {/* Anciennes routes dashboard avec underscores / majuscules */}
        <Route path="/Dashboard/Ajouter_produit" element={<Navigate to="/dashboard/ajouter-produit" replace />} />
        <Route path="/Dashboard/Ajouter_article" element={<Navigate to="/dashboard/ajouter-article" replace />} />
        <Route path="/Dashboard/Ajouter_categorie" element={<Navigate to="/dashboard/ajouter-categorie" replace />} />
        <Route path="/Dashboard/Modifier/:id" element={<Navigate to="/dashboard/modifier/:id" replace />} />
        <Route path="/Dashboard/Articles/:id/edit" element={<Navigate to="/dashboard/articles/:id/edit" replace />} />
        <Route path="/Dashboard/Categories/:id/edit" element={<Navigate to="/dashboard/categories/:id/edit" replace />} />

        {/* 404 → retour accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

export default App;
