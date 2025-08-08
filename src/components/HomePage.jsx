import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css';
import avengers from "../assets/avengers.webp"
const HomePage = () => {
  const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await axios.get('http://localhost:5555/movies');
        setPopularMovies(response.data); // ✅ No `.results`
      } catch (err) {
        console.error('Failed to fetch movies', err);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="home-container">
      
      <h2 className="section-title">All Movies</h2>
      <div className="movie-grid">
        {popularMovies.map((movie) => (
          <div className="movie-card" key={movie.movie_id}>
            <img
              src={movie["poster"]}
              alt={movie["title"]}
              className="movie-poster"
            />
            <h4 className="movie-title">{movie.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
