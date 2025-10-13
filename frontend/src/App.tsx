import React from "react";
import { Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import About from "./pages/About";
import Produits from "./pages/Produits";
import Services from "./pages/Services";
import Assistance from "./pages/Assistance";
import Compte from "./pages/Compte";
import Connexion from "./pages/Connexion";
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
        {/* <Route path="/assistance" element={<Assistance />} />
        <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </main>
  );
};

export default App;
