import React, { useState } from 'react';
import './Navbar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MovieNotFound from './MovieNotFound';
import { FaHome } from 'react-icons/fa';

function Navbar({ movie, setMovie, recommendations, setRecommendations, loading, setLoading }) {
  const navigate = useNavigate();
  const [errormsg, setErrormsg] = useState('');
  const [searchMode, setSearchMode] = useState('movie'); // default search mode

  const fetchRecommendations = async () => {
  if (!movie.trim()) {
    setErrormsg('Please enter a search term.');
    return;
  }

  setLoading(true);
  setErrormsg('');
  try {
    let response;

    if (searchMode === 'movie') {
      response = await axios.post('http://localhost:5555/recommendation', {
        movie: movie.trim()
      });
    } else if (searchMode === 'actor') {
      response = await axios.post('http://localhost:5555/search_by_cast', {
        actor: movie.trim()
      });
    } else if (searchMode === 'director') {
      response = await axios.post('http://localhost:5555/search_by_director', {
        director: movie.trim()
      });
    } else if (searchMode === 'keyword') {
      response = await axios.post('http://localhost:5555/search_by_keyword', {
        keyword: movie.trim()
      });
    }

    if (response.data.error) {
      setErrormsg(response.data.error);
      setRecommendations([]);
      return;
    }

    if (response.data.length === 0) {
      setErrormsg('No results found.');
      setRecommendations([]);
      return;
    }

    setRecommendations(response.data);
    navigate('/recommend');
  } catch (error) {
    setErrormsg('Server error or data not found.');
    setRecommendations([]);
    console.error("Error fetching recommendations:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="Navbar">
      <div className="nav-buttons">
        <button
          className="nav-homebutton"
          onClick={() => {
            navigate("/");
            setMovie('');
            setRecommendations([]);
            setErrormsg('');
          }}
        >
          <FaHome style={{ marginRight: '8px' }} />
          Home
        </button>
      </div>

      <h1 className="title-navbar">Movie Recommendation System</h1>

      <div className="navbar-search-container">
<select
  className="search-mode-select"
  value={searchMode}
  onChange={(e) => setSearchMode(e.target.value)}
  aria-label="Select search mode"
>
  <option value="movie">Movie</option>
  <option value="actor">Actor</option>
  <option value="director">Director</option>
  <option value="keyword">Keyword</option> 
</select>


        <input
          className="search-bar"
          type="text"
          placeholder={
  searchMode === 'movie'
    ? "🔍 Search for your next binge-worthy movie..."
    : searchMode === 'actor'
    ? "🎭 Search movies by actor name..."
    : searchMode === 'director'
    ? "🎬 Search movies by director name..."
    : "🔑 Search movies by keyword..."
}

          value={movie}
          onChange={(e) => setMovie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchRecommendations();
            }
          }}
          disabled={loading}
        />

        <button
          type="button"
          className="nav-button"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Recommend'}
        </button>
      </div>

      {errormsg && <MovieNotFound message={errormsg} />}
    </div>
  );
}

export default Navbar;
