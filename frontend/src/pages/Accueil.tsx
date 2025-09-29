import React from "react";
import Navbar from "../components/Navbar";

const Accueil: React.FC = () => {
  return (
    <>
      <Navbar />
      <section className="pt-6">
        <h1 className="text-2xl font-bold">Accueil</h1>
        <p className="mt-2 text-white/80">
          Contenu de la page d’accueil…
        </p>
      </section>
    </>
  );
};

export default Accueil;
