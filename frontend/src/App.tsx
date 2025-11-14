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
// import Assistance from "./pages/Assistance";
// import Contact from "./pages/Contact";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";

const App: React.FC = () => {
   const { i18n } = useTranslation();
  return (
    <main className="">
      <Routes  key={i18n.language}>
        <Route path="/" element={<Accueil key={i18n.language}/>} />
        <Route path="/a-propos" element={<About  key={i18n.language}/>} /> 
        <Route path="/Produits" element={<Produits  key={i18n.language} />} />
        <Route path="/Services" element={<Services   key={i18n.language}/>} />
        <Route path="/Assistance" element={<Assistance  key={i18n.language}/>} />
        <Route path="/Dashboard/Sighup" element={<Sighup />} />
        <Route path="/Dashboard/Connexion" element={<Connexion />} />
        <Route path="/Dashboard"element={<PrivateRoute><Dashboard /></PrivateRoute> } />
        <Route path="/Dashboard/Ajouter_produit" element={ <PrivateRoute><AddProduct /></PrivateRoute> } />
        <Route path="/Dashboard/Ajouter_article" element={<PrivateRoute><AddArticle /></PrivateRoute> } />
        <Route path="/Dashboard/Modifier/:id" element={<PrivateRoute><UpdateProduct /></PrivateRoute>} />
        <Route path="/Dashboard/Articles/:id/edit" element={<PrivateRoute><UpdateArticle /></PrivateRoute> } />
        {/* Redirections utiles (majuscules / anciennes URLs) */}
        <Route path="/Connexion" element={<Navigate to="/dashboard/connexion" replace />} />
        <Route path="/Sighup" element={<Navigate to="/dashboard/inscription" replace />} />
        <Route path="/Dashboard/Connexion" element={<Navigate to="/dashboard/connexion" replace />} />
        <Route path="/Dashboard/Sighup" element={<Navigate to="/dashboard/inscription" replace />} />
        <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

export default App;
