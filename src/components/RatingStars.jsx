import React from 'react';

const RatingStars = ({ 
  rating, 
  maxRating = 5, 
  onRatingChange = null, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating) => {
    if (onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleKeyDown = (event, starRating) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStarClick(starRating);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} role="radiogroup" aria-label="Rating">
      {[...Array(maxRating)].map((_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= rating;
        
        return (
          <button
            key={index}
            type="button"
            className={`${sizeClasses[size]} ${
              onRatingChange 
                ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded' 
                : 'cursor-default'
            } transition-all duration-150`}
            onClick={() => handleStarClick(starRating)}
            onKeyDown={(e) => handleKeyDown(e, starRating)}
            disabled={!onRatingChange}
            role="radio"
            aria-checked={isFilled}
            aria-label={`${starRating} star${starRating !== 1 ? 's' : ''}`}
            tabIndex={onRatingChange ? 0 : -1}
          >
            <svg
              className={`w-full h-full ${
                isFilled 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 fill-current'
              } ${onRatingChange ? 'hover:text-yellow-300' : ''}`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600" aria-live="polite">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  );
};

export default RatingStars;