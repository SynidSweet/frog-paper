import { motion } from 'framer-motion'

function MovieCard({ movie, index, onSelect }) {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2NjYyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiLz48L3N2Zz4='

  return (
    <motion.div
      className="movie-card"
      onClick={() => onSelect(movie)}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -5, 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.img
        src={posterUrl}
        alt={movie.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
      />
      <div className="movie-card-info">
        <h4 className="movie-card-title">{movie.title}</h4>
        <p className="movie-card-year">
          {movie.release_date ? movie.release_date.split('-')[0] : ''}
        </p>
      </div>
    </motion.div>
  )
}

export default MovieCard