from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import pandas as pd
import ast
import requests
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict

app = Flask(__name__)
CORS(app)


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'        
app.config['MYSQL_PASSWORD'] = 'root'    
app.config['MYSQL_DB'] = 'movie_recommendation_system'

mysql = MySQL(app)

ps = PorterStemmer()

def convert(obj):
    return [i['name'] for i in ast.literal_eval(obj)]

def convert3(obj):
    return [i['name'] for i in ast.literal_eval(obj)[:3]]

def convertname(obj):

    for i in ast.literal_eval(obj):
        if i['job'] == "Director":
            return [i['name']]
    return []

def stem(text):
    return " ".join([ps.stem(word) for word in text.split()])

def normalize_name(name):

    return "".join(name.lower().split())


movies = pd.read_csv('movie/movie-recommendation/src/tmdb_5000_movies.csv')
credits = pd.read_csv('movie/movie-recommendation/src/tmdb_5000_credits.csv', on_bad_lines='skip')

movies = movies.merge(credits, on='title')
movies = movies[['movie_id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew']]
movies.dropna(inplace=True)

movies['genres'] = movies['genres'].apply(convert)
movies['keywords'] = movies['keywords'].apply(convert)
movies['cast'] = movies['cast'].apply(convert3)
movies['crew'] = movies['crew'].apply(convertname)
movies['overview'] = movies['overview'].apply(lambda x: x.split())
movies['genres'] = movies['genres'].apply(lambda x: [i.replace(" ", "") for i in x])
movies['keywords'] = movies['keywords'].apply(lambda x: [i.replace(" ", "") for i in x])
movies['cast'] = movies['cast'].apply(lambda x: [i.replace(" ", "") for i in x])
movies['crew'] = movies['crew'].apply(lambda x: [i.replace(" ", "") for i in x])
movies['tags'] = movies['overview'] + movies['genres'] + movies['keywords'] + movies['crew']

newdf = movies[['movie_id', 'title', 'tags']].copy()
newdf['tags'] = newdf['tags'].apply(lambda x: " ".join(x).lower())
newdf['tags'] = newdf['tags'].apply(stem)

cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(newdf['tags']).toarray()
similarity = cosine_similarity(vectors)

cast_index = defaultdict(list)
for idx, cast_list in movies['cast'].items():
    for actor in cast_list:
        cast_index[normalize_name(actor)].append(idx)

director_index = defaultdict(list)
for idx, director_list in movies['crew'].items():
    for director in director_list:
        director_index[normalize_name(director)].append(idx)

with app.app_context():
    cur = mysql.connection.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS poster_cache (
            movie_id VARCHAR(50) PRIMARY KEY,
            poster_url TEXT
        );
    """)
    mysql.connection.commit()
    cur.close()

def fetch_poster(movie_id):
    movie_id_str = str(movie_id)
    cur = mysql.connection.cursor()

    cur.execute("SELECT poster_url FROM poster_cache WHERE movie_id = %s", (movie_id_str,))
    result = cur.fetchone()
    if result:
        cur.close()
        return result[0]

    try:
        response = requests.get(
            f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=0e118a20ca98d14c5b9b2b1d76981cd7&language=en-US"
        )
        data = response.json()
        poster_path = data.get('poster_path')
        if poster_path:
            full_path = "https://image.tmdb.org/t/p/w500/" + poster_path
        else:
            full_path = "https://via.placeholder.com/500x750?text=No+Image"

        cur.execute(
            "INSERT INTO poster_cache (movie_id, poster_url) VALUES (%s, %s) ON DUPLICATE KEY UPDATE poster_url=%s",
            (movie_id_str, full_path, full_path)
        )
        mysql.connection.commit()
        cur.close()
        return full_path
    except Exception as e:
        print(f"Error fetching poster for movie ID {movie_id}: {e}")
        cur.close()
        return "https://via.placeholder.com/500x750?text=No+Image"

def recommend(movie):
    movie = movie.lower()
    if movie not in newdf['title'].str.lower().values:
        return {'error': 'Movie not found in the dataset.'}

    movie_index = newdf[newdf['title'].str.lower() == movie].index[0]
    distances = similarity[movie_index]
    movies_list = sorted(
        list(enumerate(distances)), reverse=True, key=lambda x: x[1]
    )[1:31]

    recommendations = []
    for i in movies_list:
        idx = i[0]
        title = movies.iloc[idx].title
        tmdb_id = movies.iloc[idx].movie_id
        poster = fetch_poster(tmdb_id)
        overview = " ".join(movies.iloc[idx].overview)
        recommendations.append({"title": title, "poster": poster, "movie_id": int(tmdb_id), "overview": overview})

    return recommendations

@app.route('/movies', methods=['GET'])
def get_all_movies():
    movie_data = []
    for idx, row in movies.head(30).iterrows():
        movie_data.append({
            'title': row['title'],
            'movie_id': int(row['movie_id']),
            'poster': fetch_poster(row['movie_id'])
        })
    return jsonify(movie_data)

@app.route('/recommendation', methods=['POST'])
def recommend_api():
    data = request.json
    movie_name = data.get('movie', '')
    result = recommend(movie_name)
    return jsonify(result)

@app.route('/search_by_cast', methods=['POST'])
def search_by_cast():
    data = request.json
    actor_name = data.get('actor', '').lower()
    actor_name = "".join(actor_name.split())

    print(f"Searching for actor: '{actor_name}'") 
    movie_indices = cast_index.get(actor_name, [])
    print(f"Found {len(movie_indices)} movies for actor '{actor_name}'")  

    results = []
    for idx in movie_indices:
        row = movies.iloc[idx]
        results.append({
            'title': row['title'],
            'movie_id': int(row['movie_id']),
            'poster': fetch_poster(row['movie_id']),
            'overview': " ".join(row['overview'])
        })

    return jsonify(results)

@app.route('/search_by_director', methods=['POST'])
def search_by_director():
    data = request.json
    director_name = data.get('director', '').lower()
    director_name = "".join(director_name.split())

    print(f"Searching for director: '{director_name}'") 
    movie_indices = director_index.get(director_name, [])
    print(f"Found {len(movie_indices)} movies for director '{director_name}'")

    results = []
    for idx in movie_indices:
        row = movies.iloc[idx]
        results.append({
            'title': row['title'],
            'movie_id': int(row['movie_id']),
            'poster': fetch_poster(row['movie_id']),
            'overview': " ".join(row['overview'])
        })

    return jsonify(results)
@app.route('/search_by_keyword', methods=['POST'])
def search_by_keyword():
    data = request.json
    keyword = data.get('keyword', '').lower().strip()
    if not keyword:
        return jsonify({'error': 'Keyword not provided.'})

    matched = newdf[newdf['tags'].str.contains(keyword)]

    if matched.empty:
        return jsonify([])  

    recommendations = []
    for idx, row in matched.head(30).iterrows(): 
        title = movies.loc[idx, 'title']
        tmdb_id = movies.loc[idx, 'movie_id']
        poster = fetch_poster(tmdb_id)
        overview = " ".join(movies.iloc[idx].overview)
        recommendations.append({"title": title, "poster": poster, "movie_id": int(tmdb_id), "overview": overview})

    return jsonify(recommendations)
@app.route('/movie_trailer/<int:movie_id>', methods=['GET'])
def get_movie_trailer(movie_id):
    try:
        response = requests.get(
            f"https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key=0e118a20ca98d14c5b9b2b1d76981cd7&language=en-US"
        )
        data = response.json()
        # Filter trailers
        trailers = [video for video in data.get('results', []) if video['type'] == 'Trailer' and video['site'] == 'YouTube']
        if trailers:
            # Return the first trailer's YouTube key
            return jsonify({'youtube_key': trailers[0]['key']})
        else:
            return jsonify({'error': 'Trailer not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=True)
