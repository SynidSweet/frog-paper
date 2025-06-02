import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CONFIG from '../config'

function ImageSelector({ movie, onImageSelect, currentIndex = 0, show = true }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (movie?.id) {
      fetchMovieImages(movie.id)
    }
  }, [movie])

  const fetchMovieImages = async (movieId) => {
    setLoading(true)
    try {
      const response = await fetch(
        `${CONFIG.TMDB_BASE_URL}/movie/${movieId}/images?api_key=${CONFIG.TMDB_API_KEY}`
      )
      const data = await response.json()
      
      // Get backdrops and filter out ones without file_path
      const validBackdrops = data.backdrops?.filter(img => img.file_path) || []
      setImages(validBackdrops)
      
      // If current movie has a backdrop_path, make sure it's first
      if (movie.backdrop_path) {
        const currentImage = { file_path: movie.backdrop_path }
        const otherImages = validBackdrops.filter(img => img.file_path !== movie.backdrop_path)
        setImages([currentImage, ...otherImages])
      }
    } catch (error) {
      console.error('Failed to fetch movie images:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onImageSelect(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onImageSelect(currentIndex + 1)
    }
  }

  const handleNumberClick = (index) => {
    onImageSelect(index)
  }

  if (!movie || images.length <= 1 || !show) {
    return null
  }

  return (
    <motion.div
      className="image-selector"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="image-selector-content">
        <button 
          className="image-nav-btn" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ‹
        </button>
        
        <span className="image-counter">
          {currentIndex + 1} of {images.length}
        </span>
        
        <button 
          className="image-nav-btn" 
          onClick={handleNext}
          disabled={currentIndex >= images.length - 1}
        >
          ›
        </button>
      </div>
    </motion.div>
  )
}

export default ImageSelector