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

const App: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <main className="">
      <Routes key={i18n.language}>
        {/* Public */}
        <Route path="/" element={<Accueil key={i18n.language} />} />
        <Route path="/a-propos" element={<About key={i18n.language} />} />
        <Route path="/produits" element={<Produits key={i18n.language} />} />
        <Route path="/services" element={<Services key={i18n.language} />} />
        <Route path="/assistance" element={<Assistance key={i18n.language} />} />

        {/* Auth */}
        <Route path="/dashboard/inscription" element={<Sighup />} />
        <Route path="/dashboard/connexion" element={<Connexion />} />

        {/* Dashboard privé */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/ajouter-produit"
          element={
            <PrivateRoute>
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/ajouter-article"
          element={
            <PrivateRoute>
              <AddArticle />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/modifier/:id"
          element={
            <PrivateRoute>
              <UpdateProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/articles/:id/edit"
          element={
            <PrivateRoute>
              <UpdateArticle />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/categories/:id/edit"
          element={
            <PrivateRoute>
              <UpdateCathegorie />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/ajouter-categorie"
          element={
            <PrivateRoute>
              <AddCathegorie />
            </PrivateRoute>
          }
        />

        {/* 404 → retour accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

export default App;
