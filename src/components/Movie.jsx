import React, { useState } from 'react';
import './Movie.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import defaultPoster from '../assets/avengers.webp';

const Movie = ({ recommendations }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  // Fetch trailer YouTube key from backend
  const fetchTrailer = async (movieId) => {
    try {
      setLoadingTrailer(true);
      const response = await fetch(`http://localhost:5555/movie_trailer/${movieId}`);
      const data = await response.json();
      setLoadingTrailer(false);
      return data.youtube_key || null;
    } catch (error) {
      console.error("Error fetching trailer:", error);
      setLoadingTrailer(false);
      return null;
    }
  };

  const handleCardClick = async (movie) => {
    const key = await fetchTrailer(movie.movie_id);
    if (key) {
      setTrailerKey(key);
      setShowPlayer(true);
    } else {
      alert("Trailer not available");
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setTrailerKey('');
  };

  return (
    <div className="card-container">
      {recommendations.map((rec, idx) => (
        <div
          key={idx}
          className="movie-card"
          onClick={() => handleCardClick(rec)}
          tabIndex={0}
          role="button"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCardClick(rec);
            }
          }}
          aria-label={`Watch trailer for ${rec.title}`}
        >
          <img
            src={rec.poster || defaultPoster}
            alt={`Poster of ${rec.title}`}
            className="movie-poster"
          />
          <div className="movie-details-overlay">
            <h3>{rec.title}</h3>
            <p>{rec.overview ? rec.overview : "No description available."}</p>
          </div>
        </div>
      ))}

      {/* Trailer Modal */}
      {showPlayer && (
        <div className="modal-overlay" onClick={closePlayer} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={closePlayer}
              aria-label="Close trailer"
            >
              ×
            </button>
            {loadingTrailer ? (
              <div className="loading">Loading trailer...</div>
            ) : (
              <iframe
                width="100%"
                height="450"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Movie;
