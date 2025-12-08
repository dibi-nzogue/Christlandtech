import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTopButton from "../components/ScrollToTopButton";
import AssistanceHero from "../components/AssistanceHero";
// import ServicesBloc from "../components/ServicesBloc";
import PostsSection from "../components/PostsSection";
import ContactSection from "../components/ContactSection";
import GlobalLoader from "../components/GlobalLoader";
import { useGlobalLoading } from "../hooks/useFetchQuery";

const Assistance: React.FC = () => {
  const isLoading = useGlobalLoading();   // 👈 écoute le loader global
  return (
    <>
      {isLoading && <GlobalLoader />}     {/* 👈 overlay partout tant qu'il y a des fetchs */}
    <div>
      <Navbar />
      <AssistanceHero />
      <PostsSection />
      <ContactSection  id="contact"/>
      <Footer />
      <ScrollToTopButton />
    </div>
       </>
  );
};

export default Assistance;
