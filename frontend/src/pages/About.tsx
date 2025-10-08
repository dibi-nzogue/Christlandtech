import React from 'react'
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import ScrollToTopButton from "../components/ScrollToTopButton";
import HeroAbout from '../components/HeroAbout';
import ContactSection from '../components/ContactSection';

const About: React.FC = () => {
  return (
    <div>
        <Navbar />
        <HeroAbout />
        <ContactSection />
        <Footer />
        <ScrollToTopButton />
    </div>
  )
}

export default About