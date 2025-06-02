import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MovieCard from './MovieCard'
import CONFIG from '../config'

function MovieGallery({ show, onHide, onMovieSelect, movies, isDarkTheme }) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const itemsPerView = 6 // Number of movies visible at once
  
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && show) {
        onHide()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [show, onHide])

  // Reset scroll when movies change
  useEffect(() => {
    setScrollPosition(0)
  }, [movies])

  const handleMovieSelect = (movie) => {
    onMovieSelect(movie)
  }

  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition + itemsPerView < movies.length

  const scrollLeft = () => {
    if (canScrollLeft) {
      setScrollPosition(Math.max(0, scrollPosition - 1))
    }
  }

  const scrollRight = () => {
    if (canScrollRight) {
      setScrollPosition(Math.min(movies.length - itemsPerView, scrollPosition + 1))
    }
  }

  const visibleMovies = movies.slice(scrollPosition, scrollPosition + itemsPerView)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="movie-gallery"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onHide()
            }
          }}
        >
          <div className="gallery-content">
            <div className="movie-slider">
              {canScrollLeft && (
                <button 
                  className="scroll-arrow scroll-left" 
                  onClick={scrollLeft}
                  aria-label="Previous movies"
                >
                  &#8249;
                </button>
              )}
              
              <div className="movie-cards-container">
                <div className="movie-cards">
                  {visibleMovies.map((movie, index) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      index={index}
                      onSelect={handleMovieSelect}
                    />
                  ))}
                </div>
              </div>
              
              {canScrollRight && (
                <button 
                  className="scroll-arrow scroll-right" 
                  onClick={scrollRight}
                  aria-label="Next movies"
                >
                  &#8250;
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MovieGallery