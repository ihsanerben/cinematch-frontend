import React from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // 1. useLocation eklendi
import logo from "../../assets/auth/cinematch.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 2. Mevcut URL'i almak için hook
  const token = localStorage.getItem("token");

  const handleProtectedClick = (path) => {
    if (!token) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  // 3. Kod tekrarını önlemek için küçük bir yardımcı fonksiyon
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-left" onClick={() => navigate("/")}>
        <img src={logo} alt="CineMatch Logo" className="navbar-logo-img" />
      </div>

      {/* Linkler */}
      <ul className="navbar-links">
        <li className={isActive("/home")}>
          <Link to="/home">Home</Link>
        </li>

        <li className={isActive("/movies")}>
          <Link to="/movies">Movies</Link>
        </li>

        <li className={isActive("/series")}>
          <Link to="/series">Series</Link>
        </li>

        {/* 🔐 Protected Routes */}
        <li
          className={isActive("/recommendations")}
          onClick={() => handleProtectedClick("/recommendations")}
        >
          Recommendations
        </li>

        <li
          className={isActive("/favorites")}
          onClick={() => handleProtectedClick("/favorites")}
        >
          Favorites
        </li>

        <li
          className={isActive("/old-recommendations")}
          onClick={() => handleProtectedClick("/old-recommendations")}
        >
          Old Recommendations
        </li>

        <li
          className={isActive("/profile")}
          onClick={() => handleProtectedClick("/profile")}
        >
          Profile
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
