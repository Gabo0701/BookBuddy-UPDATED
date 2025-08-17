import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaTrash, FaStar, FaRegStar } from "react-icons/fa";
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

  const toggleSave = () => {
    const savedBooks = JSON.parse(localStorage.getItem("savedBooks")) || [];
    if (isSaved) {
      const updated = savedBooks.filter((b) => b.key !== book.key);
      localStorage.setItem("savedBooks", JSON.stringify(updated));
      setIsSaved(false);
      // Dispatch custom event for UserPage to listen
      window.dispatchEvent(new CustomEvent('bookRemoved', { detail: book }));
    } else {
      localStorage.setItem("savedBooks", JSON.stringify([...savedBooks, book]));
      setIsSaved(true);
      // Dispatch custom event for UserPage to listen
      window.dispatchEvent(new CustomEvent('bookSaved', { detail: book }));
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteBooks")) || [];
    if (isFavorite) {
      const updated = favorites.filter((b) => b.key !== book.key);
      localStorage.setItem("favoriteBooks", JSON.stringify(updated));
      setIsFavorite(false);
      window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: book }));
    } else {
      localStorage.setItem("favoriteBooks", JSON.stringify([...favorites, book]));
      setIsFavorite(true);
      window.dispatchEvent(new CustomEvent('favoriteAdded', { detail: book }));
    }
    
    if (onToggleFavorite) {
      onToggleFavorite(book, !isFavorite);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(book, listType);
    } else if (listType === 'saved') {
      // Handle saved books deletion directly if no onDelete handler
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
      const updated = savedBooks.filter((b) => b.key !== book.key);
      localStorage.setItem('savedBooks', JSON.stringify(updated));
      setIsSaved(false);
      window.dispatchEvent(new CustomEvent('bookRemoved', { detail: book }));
    } else if (listType === 'favorites') {
      // Handle favorites deletion directly if no onDelete handler
      const favorites = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
      const updated = favorites.filter((b) => b.key !== book.key);
      localStorage.setItem('favoriteBooks', JSON.stringify(updated));
      setIsFavorite(false);
      window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: book }));
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
              book.coverId
                ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
                : "https://via.placeholder.com/150x200?text=No+Cover"
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