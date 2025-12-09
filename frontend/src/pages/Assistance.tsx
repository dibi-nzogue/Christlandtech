import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import AssistanceHero from "../components/AssistanceHero";
// import ServicesBloc from "../components/ServicesBloc";
import PostsSection from "../components/PostsSection";
import ContactSection from "../components/ContactSection";



const Assistance: React.FC = () => {
  return (
    <div>
      <Navbar />
      <AssistanceHero />
      <PostsSection />
      <ContactSection id="contact" />
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};


export default Assistance;
