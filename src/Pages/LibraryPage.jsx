import React, { useEffect, useState } from "react";
import "./LibraryPage.css";
import BookCard from "../components/BookCard";
import Button from "../components/Button";

const LibraryPage = () => {
  const [savedBooks, setSavedBooks] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedBooks")) || [];
    setSavedBooks(stored);
  }, []);

  const removeBook = (key) => {
    const updated = savedBooks.filter((book) => book.key !== key);
    setSavedBooks(updated);
    localStorage.setItem("savedBooks", JSON.stringify(updated));
  };

  return (
    <div className="library-page">
      <div className="library-top">
        <h2>Your Saved Library <span className="emoji">📚</span></h2>
        <Button to="/" variant="primary">Back to Home</Button>
      </div>

      {savedBooks.length === 0 ? (
        <p className="empty-msg">You have no saved books yet.</p>
      ) : (
        <div className="library-grid">
          {savedBooks.map((book) => (
            <BookCard key={book.key} book={book} showRemove onRemove={removeBook} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;