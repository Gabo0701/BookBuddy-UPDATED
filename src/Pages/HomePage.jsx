import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import "./HomePage.css";

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res  = await fetch(
          "https://openlibrary.org/subjects/fantasy.json?limit=5"
        );
        const data = await res.json();
        setFeaturedBooks(data.works || []);
      } catch (err) {
        console.error("Failed to load featured books:", err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-container">
      {/* HERO */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <h2>Discover Your Next Favorite Book</h2>
        <p>Search, save, and explore a world of books with BookBuddy.</p>
        <div className="hero-buttons">
          <Link className="btn-primary" to="/search">
            Get Started
          </Link>
          <Button to="/learn-more" variant="secondary">
            Learn More
          </Button>
        </div>
      </motion.section>

      {/* FEATURED */}
      <motion.section
        className="featured-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        <div className="featured-header">
          <h3>Featured Books</h3>
          <Button to="/search">View All</Button>
        </div>
        <div className="book-cards">
          {featuredBooks.map((book) => (
            <motion.div
              key={book.key}
              className="book-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={
                  book.cover_id
                    ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
                    : "https://via.placeholder.com/150x200?text=No+Cover"
                }
                alt={book.title}
              />
              <p>{book.title}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CATEGORIES */}
      <section className="category-section">
        <div className="category-wrapper">
          <h2>Search by Category</h2>
          <div className="category-cards">
            <Link to="/search?category=Romance" className="category-card">
              ❤️<strong>Romance</strong>
            </Link>
            <Link to="/search?category=Fantasy" className="category-card">
              🔮<strong>Fantasy</strong>
            </Link>
            <Link to="/search?category=Mystery" className="category-card">
              🕵️‍♀️<strong>Mystery</strong>
            </Link>
            <Link to="/search?category=History" className="category-card">
              🏛<strong>History</strong>
            </Link>
            <Link to="/search?category=Education" className="category-card">
              🎓<strong>Education</strong>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}