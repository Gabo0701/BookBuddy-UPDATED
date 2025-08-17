import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo">
          <img
            src="/bookbuddy-logo.png"
            alt="BookBuddy logo featuring an open book with friendly colors, conveying a welcoming and inviting atmosphere. The text BookBuddy appears next to the logo."
          />
          <h1>BookBuddy</h1>
        </div>
        <input type="text" placeholder="🔍 Search books..." className="search-bar" />
        <div className="icons">
          <span>🤍</span>
          <span>👤</span>
        </div>
      </header>

      <section className="hero">
        <h2>Discover <br /><span className="highlight">great books</span></h2>
        <p>A simple way to find, save, and organize the books you love</p>
        <Link to="/search">
          <button className="cta-btn">Start exploring →</button>
        </Link>
      </section>

      <section className="genres">
        <h3>Browse by genre</h3>
        <div className="genre-list">
          {["Fiction", "Thriller", "Romance", "Adventure", "History", "Self-Help"].map((genre) => (
            <div className="genre-card" key={genre}>
              <span className="icon">📚</span>
              <p>{genre}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="featured">
        <h3>Featured books</h3>
        <p>Curated selections from our community</p>
        <div className="book-cards">

          <div className="book-card">
            <img
              src="/milk-and-honey.jpg"
              alt="Book cover for The Seven Husbands of Evelyn Hugo by Taylor Jenkins Reid. The cover features elegant typography and a glamorous, vintage-inspired design, evoking a sense of drama and intrigue."
            />
            <p className="title">The Seven Husbands of Evelyn Hugo</p>
            <p className="author">Taylor Jenkins Reid</p>
          </div>
          <div className="book-card">
            <img
              src="/atomic-habits.jpg"
              alt="Book cover for Atomic Habits by James Clear. The cover displays bold, clean text with a minimalist design, suggesting clarity and motivation for personal growth."
            />
            <p className="title">Atomic Habits</p>
            <p className="author">James Clear</p>
          </div>
          <div className="book-card">
            <img
              src="/midnight-library.jpg"
              alt="Book cover for The Midnight Library by Matt Haig. The cover shows a whimsical, starry night sky with a row of books, creating a magical and contemplative mood."
            />
            <p className="title">The Midnight Library</p>
            <p className="author">Matt Haig</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;