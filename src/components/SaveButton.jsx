import React from 'react';

const SaveButton = ({ onClick, isSaved }) => {
  return (
    <button onClick={onClick} className="save-button">
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
};

export default SaveButton;