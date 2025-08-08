# Movie Recommendation System

A full-stack movie recommendation system built with a Flask backend and React frontend. It uses TMDB data to recommend movies based on various criteria like movie similarity, actor, director, and keywords. The backend also fetches movie posters and trailers from TMDB API and caches poster URLs for efficiency.

---

## Features

- Recommend movies similar to a given movie title.
- Search movies by actor name.
- Search movies by director name.
- Search movies by keyword.
- Fetch and cache movie poster images.
- Fetch YouTube trailers for movies.
- Responsive React frontend with search modes and detailed recommendations.

---

## Technologies Used

- **Backend:** Python, Flask, Flask-MySQLdb, Flask-CORS, Pandas, scikit-learn, NLTK, Requests, MySQL
- **Frontend:** React, Axios, React Router, Bootstrap, React Icons
- **Data:** TMDB dataset (`tmdb_5000_movies.csv` and `tmdb_5000_credits.csv`)
- **API:** TMDB API for posters and trailers

---

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm/yarn
- MySQL Server
- TMDB API key (get it from https://www.themoviedb.org/documentation/api)

### Backend Setup

1. Clone this repository.

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt

3.Configure MySQL:

- Create a database named movie_recommendation_system.<br>
- Update the MySQL credentials in app.py:<br>
     app.config['MYSQL_HOST'] = 'localhost'<br>
     app.config['MYSQL_USER'] = 'your_mysql_username'<br>
     app.config['MYSQL_PASSWORD'] = 'your_mysql_password'<br>
     app.config['MYSQL_DB'] = 'movie_recommendation_system'<br>


4.Place the TMDB dataset CSV files in the movie/movie-recommendation/src:

tmdb_5000_movies.csv

tmdb_5000_credits.csv

5.Set your TMDB API key in app.py in the fetch functions:<br>
api_key = "YOUR_TMDB_API_KEY"<br>


6.Run the Flask backend:
```
python app.py
```
Backend will run on http://localhost:5555.

## Frontend Setup
1.Navigate to the frontend directory

2.Install dependencies:
```
npm install
```

3.Start the React development server:
```
npm run dev
```

Frontend will run on http://localhost:5173.

Usage:-
<li>Use the search bar to enter a movie name, actor, director, or keyword.</li>
<li>Switch between search modes using the dropdown.</li>
<li>Click on a movie card to watch its trailer and view details.</li>
<li>Recommendations will show related movies based on your search.</li>
<br>

## Folder Structure:
```
├── backend/
│   ├── app.py
│   └── movie/
│       └── movie-recommendation/
│           └── src/
│               ├── tmdb_5000_movies.csv
│               └── tmdb_5000_credits.csv
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   └── App.js
│   └── package.json
└── README.md
```


## API Endpoints

| Endpoint                  | Method | Description                                      |
|---------------------------|--------|--------------------------------------------------|
| `/movies`                 | GET    | Returns a list of movies (first 30)              |
| `/recommendation`         | POST   | Get recommendations based on movie title         |
| `/search_by_cast`         | POST   | Search movies by actor name                       |
| `/search_by_director`     | POST   | Search movies by director name                    |
| `/search_by_keyword`      | POST   | Search movies by keyword                          |
| `/movie_trailer/<id>`     | GET    | Get YouTube trailer key for a given movie ID      |

