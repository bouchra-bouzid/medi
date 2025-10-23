import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Hero.css";

const Hero = () => {
  const { user } = useContext(AuthContext);

  return (
    <section className="hero">
      <div className="hero-content">
        {/* Si utilisateur connecté */}
        {user ? (
          <>
            <h1>
              {user.role === "doctor"
                ? `Bienvenue Docteur ${user.name || ""}`
                : `Bienvenue ${user.name || ""}`}
            </h1>
            <p>Ravi de vous revoir sur MediTime 🌿</p>

            <div className="hero-buttons">
              {user.role === "doctor" ? (
                // 🔽 redirection vers le dashboard du médecin
                <Link to="/doctor" className="btn btn-register">
                  Aller à mon espace
                </Link>
              ) : (
                // 🔽 patient vers son profil
                <Link to="/patient" className="btn btn-register">
                  Aller à mon espace
                </Link>
              )}
            </div>
          </>
        ) : (
          /* Si aucun utilisateur connecté */
          <>
            <h1>Prenez vos rendez-vous médicaux en ligne</h1>
            <p style={{ color: "#171718ff" }}>Rapide, simple et sécurisé pour tous vos besoins de santé.</p>

            <div className="hero-buttons">
              <Link to="/login" className="btn btn-login">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-register">
                Inscription
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Hero;
