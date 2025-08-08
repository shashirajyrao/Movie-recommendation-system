import React from 'react';
import Movie from './Movie';
import './Home.css';
function Home({ movie, setMovie, recommendations, setRecommendations }) {
  return (
    <div>
      <Movie
        movie={movie}
        setMovie={setMovie}
        recommendations={recommendations}
        setRecommendations={setRecommendations}
      />
    </div>
  );
}

export default Home;
