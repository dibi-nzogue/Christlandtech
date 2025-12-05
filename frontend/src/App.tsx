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
        <Route path="/dashboard/Sighup" element={<Sighup />} />
        <Route path="/dashboard/Connexion" element={<Connexion />} />
        <Route path="/dashboard"element={<PrivateRoute><Dashboard /></PrivateRoute> } />
        <Route path="/dashboard/Ajouter_produit" element={ <PrivateRoute><AddProduct /></PrivateRoute> } />
        <Route path="/dashboard/Ajouter_article" element={<PrivateRoute><AddArticle /></PrivateRoute> } />
        <Route path="/dashboard/Modifier/:id" element={<PrivateRoute><UpdateProduct /></PrivateRoute>} />
        <Route path="/dashboard/Articles/:id/edit" element={<PrivateRoute><UpdateArticle /></PrivateRoute> } />
        <Route path="/dashboard/Categories/:id/edit"element={<PrivateRoute><UpdateCathegorie /></PrivateRoute> }/>
        {/* Redirections utiles (majuscules / anciennes URLs) */}
        <Route path="/Connexion" element={<Navigate to="/dashboard/connexion" replace />} />
        <Route path="/Sighup" element={<Navigate to="/dashboard/inscription" replace />} />
        <Route path="/dashboard/Connexion" element={<Navigate to="/dashboard/connexion" replace />} />
        <Route path="/dashboard/Sighup" element={<Navigate to="/dashboard/inscription" replace />} />
       <Route path="/dashboard/Ajouter_categorie"element={<PrivateRoute><AddCathegorie /></PrivateRoute>} />


        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

export default App;
