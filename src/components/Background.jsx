import { motion } from 'framer-motion'
import CONFIG from '../config'

function Background({ movie }) {
  const backgroundUrl = movie?.backdrop_path 
    ? `${CONFIG.TMDB_IMAGE_BASE}${movie.backdrop_path}`
    : null

  return (
    <motion.div
      className="background"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: backgroundUrl ? 1 : 0 }}
      transition={{ duration: 1 }}
    />
  )
}

export default Background