import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CONFIG from '../config'

function MovieInfo({ movie }) {
  const [movieDetails, setMovieDetails] = useState({
    director: '—',
    dop: '—',
    year: '—',
    runtime: '—'
  })

  useEffect(() => {
    if (movie?.id) {
      fetchMovieDetails(movie.id)
      updateTitle(movie.title)
    }
  }, [movie])

  const fetchMovieDetails = async (movieId) => {
    try {
      const [detailsResponse, creditsResponse] = await Promise.all([
        fetch(`${CONFIG.TMDB_BASE_URL}/movie/${movieId}?api_key=${CONFIG.TMDB_API_KEY}`),
        fetch(`${CONFIG.TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${CONFIG.TMDB_API_KEY}`)
      ])
      
      const details = await detailsResponse.json()
      const credits = await creditsResponse.json()
      
      const director = credits.crew.find(person => person.job === 'Director')
      const dop = credits.crew.find(person => 
        person.job === 'Director of Photography' || 
        person.job === 'Cinematographer' ||
        person.job === 'Cinematography'
      )
      
      setMovieDetails({
        director: director ? director.name : '—',
        dop: dop ? dop.name : '—',
        year: details.release_date ? details.release_date.split('-')[0] : '—',
        runtime: details.runtime ? `${details.runtime} min` : '—'
      })
    } catch (error) {
      console.error('Failed to fetch movie details:', error)
    }
  }

  const updateTitle = async (title) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Suggest a Google Font that would be perfect for displaying the movie title "${title}". Consider the movie's genre, era, and mood. Respond with ONLY the exact Google Font name, nothing else. Examples: "Bebas Neue", "Playfair Display", "Montserrat"`
            }]
          }]
        })
      })
      
      const data = await response.json()
      const fontName = data.candidates[0].content.parts[0].text.trim()
      
      // Load the font dynamically
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700;900&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
      
      // Apply the font after a short delay
      setTimeout(() => {
        const titleElement = document.querySelector('.movie-title')
        if (titleElement) {
          titleElement.style.fontFamily = `'${fontName}', sans-serif`
        }
      }, 100)
    } catch (error) {
      console.error('Font selection error:', error)
    }
  }

  return (
    <div className="movie-info">
      <motion.h2 
        className="movie-title"
        key={movie?.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {movie?.title || 'Click to search'}
      </motion.h2>
      
      <motion.div 
        className="movie-details"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p>
          <span>Director:</span> 
          <span className="value">{movieDetails.director}</span>
        </p>
        <p>
          <span>DoP:</span> 
          <span className="value">{movieDetails.dop}</span>
        </p>
        <p>
          <span>Year:</span> 
          <span className="value">{movieDetails.year}</span>
        </p>
        <p>
          <span>Runtime:</span> 
          <span className="value">{movieDetails.runtime}</span>
        </p>
      </motion.div>
    </div>
  )
}

export default MovieInfo