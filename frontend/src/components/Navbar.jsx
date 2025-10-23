import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle, FaBars, FaTimes, FaBell } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">MediTime</Link>
      </div>

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <Link to="/">Accueil</Link>
         {user && <Link to="/doctors">Médecins</Link>}
        <Link to="/about">À propos</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/faq">FAQ</Link>
        {user?.role === "doctor" && (
  <>
    <Link to="/doctor/appointments">Mes Rendez-vous</Link>
  </>
)}
        {user ? (
          <>
            <Link to={user.role === "doctor" ? "/doctor" : "/patient"} className="profile-link">
              <FaUserCircle size={20} style={{ marginRight: 5 }} />
              {user.name}
            </Link>
            <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-link">Connexion</Link>
            <Link to="/register" className="btn-link register">Inscription</Link>
          </>
        )}
        
      </div>

      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </div>
    </nav>
  );
};

export default Navbar;
