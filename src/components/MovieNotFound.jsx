
import React from 'react';
import './MovieNotFound.css'; 

const MovieNotFound = () => {
  return (
    <div className="not-found-container">
      
      <h2 className="not-found-text">Oops! Movie not found.</h2>
      <p>Try searching for another movie name.</p>
    </div>
  );
};

export default MovieNotFound;
