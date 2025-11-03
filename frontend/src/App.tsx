import React from "react";
import { Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import About from "./pages/About";
import Produits from "./pages/Produits";
import Services from "./pages/Services";
import Assistance from "./pages/Assistance";
import Compte from "./pages/Compte";
import Connexion from "./pages/Connexion";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import AddArticle from "./pages/AddArticle";
import UpdateProduct from "./pages/UpdateProduct";
import UpdateArticle from "./pages/UpdateArticle";
// import Assistance from "./pages/Assistance";
// import Contact from "./pages/Contact";

const App: React.FC = () => {
  return (
    <main className="">
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/a-propos" element={<About />} /> 
        <Route path="/Produits" element={<Produits />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Assistance" element={<Assistance />} />
        <Route path="/Création-compte" element={<Compte />} />
        <Route path="/Connexion" element={<Connexion />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Dashboard/Ajouter_produit" element={<AddProduct />} />
        <Route path="/Dashboard/Ajouter_article" element={<AddArticle />} />
        <Route path="/Dashboard/Modifier/:id" element={<UpdateProduct />} />
        <Route path="/Dashboard/Articles/:id/edit" element={<UpdateArticle />} />
        {/* <Route path="/assistance" element={<Assistance />} />
        <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </main>
  );
};

export default App;
