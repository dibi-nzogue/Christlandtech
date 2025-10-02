// src/pages/Produits.tsx
import React from "react";
import Navbar from "../components/Navbar";
import Presentation from "../components/Presentation";

const Produits: React.FC = () => {
  return (
    <>
      <Navbar />
      {/* OFFSET pour ne PAS être caché par la navbar fixe */}
      <main className="pt-1 md:pt-10">
        <Presentation />
      </main>
    </>
  );
};

export default Produits;
