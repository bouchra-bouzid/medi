// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import "./Home.css"; // CSS général si nécessaire pour la page

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;
