import React from "react";
import { Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
// import Apropos from "./pages/Apropos";
// import Produits from "./pages/Produits";
// import Services from "./pages/Services";
// import Assistance from "./pages/Assistance";
// import Contact from "./pages/Contact";

const App: React.FC = () => {
  return (
    <main className="">
      <Routes>
        <Route path="/" element={<Accueil />} />
        {/* <Route path="/apropos" element={<Apropos />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/services" element={<Services />} />
        <Route path="/assistance" element={<Assistance />} />
        <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </main>
  );
};

export default App;
