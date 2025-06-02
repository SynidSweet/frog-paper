import { motion } from 'framer-motion'

function MoviePosterGrid({ movies, onMovieSelect, onMovieHover }) {
  const handleMovieHover = (movie) => {
    onMovieHover(movie)
  }

  const handleMovieLeave = () => {
    onMovieHover(null)
  }

  return (
    <div className="movie-poster-grid">
      {movies.slice(0, 6).map((movie, index) => {
        const posterUrl = movie.poster_path 
          ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2NjYyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxNTAiLz48L3N2Zz4='

        return (
          <motion.div
            key={movie.id}
            className="movie-poster"
            onClick={() => onMovieSelect(movie)}
            onMouseEnter={() => handleMovieHover(movie)}
            onMouseLeave={handleMovieLeave}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={posterUrl}
              alt={movie.title}
              draggable={false}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export default MoviePosterGrid