import React from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <span role="img" aria-label="book">📖</span>
        <strong>BookBuddy</strong>
      </div>
      <nav className="nav-links">
        <Link to="/discover">Discover</Link>
        <Link to="/browse">Browse</Link>
      </nav>
      <div className="search-signin">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input id="header-search" name="headerSearch" type="text" placeholder="Search books, authors..." />
        </div>
        <Link to="/signin" className="sign-in-btn">
          <FaUser /> <span>Sign In</span>
        </Link>
        {/* ✅ Register Button */}
        <Link to="/register" className="register-btn">
          <span>Register</span>
        </Link>
      </div>
    </header>
  );
}