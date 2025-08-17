import React from "react";
import { motion } from "framer-motion";
import { FaBook, FaSearch, FaHeart, FaShieldAlt, FaMobile, FaUsers } from "react-icons/fa";
import "./LearnMorePage.css";
import Button from "../components/Button";

const LearnMorePage = () => {
  const features = [
    {
      icon: <FaSearch />,
      title: "Smart Search",
      description: "Find books by title, author, or subject with our powerful search engine"
    },
    {
      icon: <FaHeart />,
      title: "Personal Library",
      description: "Save and organize your favorite books in your personal digital library"
    },
    {
      icon: <FaBook />,
      title: "Reading Tracking",
      description: "Track your reading progress and maintain detailed reading logs"
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security measures"
    },
    {
      icon: <FaMobile />,
      title: "Mobile Friendly",
      description: "Access your library anywhere with our responsive design"
    },
    {
      icon: <FaUsers />,
      title: "User Focused",
      description: "Built with readers in mind, featuring intuitive and clean interface"
    }
  ];

  const stats = [
    { number: "10K+", label: "Books Available" },
    { number: "500+", label: "Happy Readers" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="learn-container">
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Your Digital Reading Companion</h1>
        <p>Discover, organize, and track your reading journey with BookBuddy - the modern way to manage your personal library.</p>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="stat-item"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="features-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2>Why Choose BookBuddy?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="how-it-works"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up for free and get instant access to your personal library</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Search Books</h3>
            <p>Find books using our smart search powered by Open Library API</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Build Library</h3>
            <p>Save favorites, track reading progress, and organize your collection</p>
          </div>
        </div>
      </motion.section>

      {/* Tech Stack Section */}
      <motion.section 
        className="tech-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <h2>Built with Modern Technology</h2>
        <div className="tech-grid">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>React 19</li>
              <li>Vite</li>
              <li>Framer Motion</li>
              <li>React Router</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>MongoDB</li>
              <li>JWT Auth</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Security</h3>
            <ul>
              <li>Bcrypt Hashing</li>
              <li>Rate Limiting</li>
              <li>CORS Protection</li>
              <li>Input Validation</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <h2>Ready to Start Your Reading Journey?</h2>
        <p>Join thousands of readers who trust BookBuddy to organize their digital libraries.</p>
        <div className="cta-buttons">
          <Button to="/register" variant="primary">Get Started Free</Button>
          <Button to="/" variant="secondary">Back to Home</Button>
        </div>
      </motion.section>
    </div>
  );
};

export default LearnMorePage;