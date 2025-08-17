import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

import { fetchBooksByQuery, clearBooks } from "../features/books/booksSlice";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
import "./SearchPage.css";
import Button from "../components/Button";

export default function SearchPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const reduxBooks = useSelector((state) => state.books.books);
  const [categoryBooks, setCategoryBooks] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q");
  const category = searchParams.get("category");

  useEffect(() => {
    dispatch(clearBooks());
    setCategoryBooks([]);

    if (query) {
      dispatch(fetchBooksByQuery(query));
    } else if (category) {
      fetch(`https://openlibrary.org/subjects/${category.toLowerCase()}.json`)
        .then((res) => res.json())
        .then((data) => {
          const normalized = data.works.map((work) => ({
            key: work.key,
            title: work.title,
            author: work.authors?.[0]?.name || "Unknown",
            coverId: work.cover_id,
            olid: work.cover_edition_key || null,
          }));
          setCategoryBooks(normalized);
        });
    }
  }, [query, category, dispatch]);

  const renderBooks = () => {
    if (query) {
      if (!reduxBooks.length) return <p>No books found.</p>;

      return reduxBooks.map((book, index) => {
        const normalizedBook = {
          key: book.key || book.edition_key?.[0] || book.cover_edition_key || index,
          title: book.title,
          author: Array.isArray(book.author_name) ? book.author_name.join(", ") : book.author_name || "Unknown",
          coverId: book.cover_i,
          olid: book.edition_key?.[0] || book.cover_edition_key || null,
        };

        return (
          <motion.div key={normalizedBook.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <BookCard book={normalizedBook} />
          </motion.div>
        );
      });
    }

    if (category) {
      if (!categoryBooks.length) return <p>Loading...</p>;

      return categoryBooks.map((book) => (
        <motion.div key={book.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <BookCard book={book} />
        </motion.div>
      ));
    }

    return <p>Please enter a search term or choose a category.</p>;
  };

  return (
    <div className="search-page">
      <div className="search-top">
        <Button to="/" variant="secondary">Back to Home</Button>
        <SearchBar />
      </div>
      <h2>Search Results</h2>
      <div className="results-grid">{renderBooks()}</div>
    </div>
  );
}