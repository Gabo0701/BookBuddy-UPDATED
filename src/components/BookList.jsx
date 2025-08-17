import React from 'react';
import BookCard from './BookCard';

const BookList = ({ 
  books, 
  title, 
  listType, 
  onDeleteBook, 
  onToggleFavorite,
  showFavorite = true,
  className = '',
  emptyMessage = 'No books in this list',
  emptyIcon = '📚'
}) => {
  if (!books || books.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">{emptyIcon}</div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">{books.length} books</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {books.map((item) => {
          // Handle different book data structures
          const book = item.book || item;
          const bookKey = book.key || book.id || `book_${Math.random()}`;
          
          return (
            <BookCard
              key={bookKey}
              book={book}
              listType={listType}
              onDelete={onDeleteBook}
              onToggleFavorite={onToggleFavorite}
              showFavorite={showFavorite}
              className="book-list-item"
            />
          );
        })}
      </div>
    </div>
  );
};

export default BookList;