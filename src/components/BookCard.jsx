import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaTrash, FaStar, FaRegStar } from "react-icons/fa";
import { saveBook, toggleBookFavorite, deleteBookByKey } from "../api/books.js";
import "./BookCard.css";

const BookCard = ({ 
  book, 
  showRemove = false, 
  onRemove, 
  showFavorite = true,
  onToggleFavorite,
  onDelete,
  listType = null,
  className = ""
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const savedBooks = JSON.parse(localStorage.getItem("savedBooks")) || [];
    const exists = savedBooks.find((b) => b.key === book.key);
    setIsSaved(!!exists);

    // Check if book is in favorites
    const favorites = JSON.parse(localStorage.getItem("favoriteBooks")) || [];
    const isFav = favorites.find((b) => b.key === book.key);
    setIsFavorite(!!isFav);
  }, [book.key]);

  const toggleSave = async () => {
    try {
      if (isSaved) {
        await deleteBookByKey(book.key);
        setIsSaved(false);
        // Also update localStorage for immediate UI feedback
        const savedBooks = JSON.parse(localStorage.getItem("savedBooks")) || [];
        const updated = savedBooks.filter((b) => b.key !== book.key);
        localStorage.setItem("savedBooks", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('bookRemoved', { detail: book }));
      } else {
        await saveBook({
          title: book.title,
          author: book.author,
          key: book.key,
          coverId: book.coverId || book.cover_id,
          olid: book.olid
        });
        setIsSaved(true);
        // Also update localStorage for immediate UI feedback
        const savedBooks = JSON.parse(localStorage.getItem("savedBooks")) || [];
        localStorage.setItem("savedBooks", JSON.stringify([...savedBooks, { ...book, coverId: book.coverId || book.cover_id }]));
        window.dispatchEvent(new CustomEvent('bookSaved', { detail: book }));
      }
    } catch (error) {
      console.error('Error saving book:', error);
      // Fallback to localStorage only if API fails
      const savedBooks = JSON.parse(localStorage.getItem("savedBooks")) || [];
      if (isSaved) {
        const updated = savedBooks.filter((b) => b.key !== book.key);
        localStorage.setItem("savedBooks", JSON.stringify(updated));
        setIsSaved(false);
      } else {
        localStorage.setItem("savedBooks", JSON.stringify([...savedBooks, { ...book, coverId: book.coverId || book.cover_id }]));
        setIsSaved(true);
      }
    }
  };

  const toggleFavorite = async () => {
    try {
      await toggleBookFavorite(book.key, {
        title: book.title,
        author: book.author,
        coverId: book.coverId || book.cover_id,
        olid: book.olid
      });
      setIsFavorite(!isFavorite);
      
      // Update localStorage for immediate UI feedback
      const favorites = JSON.parse(localStorage.getItem("favoriteBooks")) || [];
      if (isFavorite) {
        const updated = favorites.filter((b) => b.key !== book.key);
        localStorage.setItem("favoriteBooks", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: book }));
      } else {
        localStorage.setItem("favoriteBooks", JSON.stringify([...favorites, { ...book, coverId: book.coverId || book.cover_id }]));
        window.dispatchEvent(new CustomEvent('favoriteAdded', { detail: book }));
      }
      
      if (onToggleFavorite) {
        onToggleFavorite(book, !isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Fallback to localStorage only if API fails
      const favorites = JSON.parse(localStorage.getItem("favoriteBooks")) || [];
      if (isFavorite) {
        const updated = favorites.filter((b) => b.key !== book.key);
        localStorage.setItem("favoriteBooks", JSON.stringify(updated));
        setIsFavorite(false);
      } else {
        localStorage.setItem("favoriteBooks", JSON.stringify([...favorites, { ...book, coverId: book.coverId || book.cover_id }]));
        setIsFavorite(true);
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (onDelete) {
        onDelete(book, listType);
      } else {
        // Delete from MongoDB
        await deleteBookByKey(book.key);
        
        // Update localStorage
        if (listType === 'saved') {
          const savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
          const updated = savedBooks.filter((b) => b.key !== book.key);
          localStorage.setItem('savedBooks', JSON.stringify(updated));
          setIsSaved(false);
          window.dispatchEvent(new CustomEvent('bookRemoved', { detail: book }));
        } else if (listType === 'favorites') {
          const favorites = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
          const updated = favorites.filter((b) => b.key !== book.key);
          localStorage.setItem('favoriteBooks', JSON.stringify(updated));
          setIsFavorite(false);
          window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: book }));
        }
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className={`book-card ${className}`}>
        <div className="cover-wrapper">
          <img
            src={
              (book.coverId || book.cover_id)
                ? `https://covers.openlibrary.org/b/id/${book.coverId || book.cover_id}-M.jpg`
                : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'%3E%3Crect width='150' height='200' fill='%23f0f0f0'/%3E%3Ctext x='75' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='%23666'%3ENo Cover%3C/text%3E%3C/svg%3E"
            }
            alt={book.title}
          />
          <div className="actions">
            {showRemove ? (
              <FaTrash className="trash-icon" onClick={() => onRemove(book.key)} />
            ) : isSaved ? (
              <FaHeart className="heart-icon filled" onClick={toggleSave} />
            ) : (
              <FaRegHeart className="heart-icon" onClick={toggleSave} />
            )}
          </div>
        </div>
        
        <div className="book-info">
          <h4>{book.title}</h4>
          {book.author && <p>{book.author}</p>}
          {book.olid && (
            <a href={`https://openlibrary.org/books/${book.olid}`} target="_blank" rel="noreferrer">
              View on Open Library
            </a>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="book-actions">
          {showFavorite && (
            <button
              onClick={toggleFavorite}
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? <FaStar /> : <FaRegStar />}
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="delete-btn"
              title="Delete book"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Book</h3>
            <p>Are you sure you want to delete "{book.title}" from your {listType || 'library'}?</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookCard;