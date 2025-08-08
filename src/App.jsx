import { useState } from 'react'
import { Route,Routes } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
import Home from './components/Home'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'

import avengers from './assets/avengers.webp';
function App() {
  const [movie,setMovie]=useState('');
  const [recommendations,setRecommendations]=useState([]);
    const [loading,setLoading]=useState(false);
  return (
    <>
    <Navbar movie={movie} setMovie={setMovie} recommendations={recommendations} setRecommendations={setRecommendations} loading={loading} setLoading={setLoading}/>
    {loading?<LoadingSpinner/>:<Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/recommend" element={<Home movie={movie} setMovie={setMovie} recommendations={recommendations} setRecommendations={setRecommendations}/>}/>
    </Routes>}
   
    </>
  )
}

export default App
