import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CONFIG from '../config'
import { getPlaylists, addMovieToPlaylist, createPlaylist } from '../utils/localStorage'
import ColorPalette from './ColorPalette'

function MovieSearch({ show, onClose, onMovieSelect }) {
  const [activeTab, setActiveTab] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [movieImages, setMovieImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)
  const [thumbnailPage, setThumbnailPage] = useState(0)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [searchPage, setSearchPage] = useState(0)
  const [colorPalette, setColorPalette] = useState([])
  const [showNumpad, setShowNumpad] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')

  useEffect(() => {
    if (show) {
      fetchPlaylists()
    }
  }, [show])

  const fetchPlaylists = () => {
    try {
      const data = getPlaylists()
      setPlaylists(data)
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    }
  }

  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${CONFIG.TMDB_BASE_URL}/search/movie?api_key=${CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
      )
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMovies(searchQuery)
      setSearchPage(0) // Reset to first page on new search
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const fetchMovieDetails = async (movie) => {
    try {
      // Get detailed movie info
      const detailsResponse = await fetch(
        `${CONFIG.TMDB_BASE_URL}/movie/${movie.id}?api_key=${CONFIG.TMDB_API_KEY}&append_to_response=credits,images`
      )
      const details = await detailsResponse.json()
      
      // Get additional images
      const imagesResponse = await fetch(
        `${CONFIG.TMDB_BASE_URL}/movie/${movie.id}/images?api_key=${CONFIG.TMDB_API_KEY}`
      )
      const images = await imagesResponse.json()
      
      setSelectedMovie(details)
      setMovieImages(images.backdrops || [])
      setSelectedImageIndex(0)
      
      // Initialize color palette for first image
      if (images.backdrops && images.backdrops.length > 0) {
        const firstImageUrl = `${CONFIG.TMDB_IMAGE_BASE}${images.backdrops[0]?.file_path}`
        extractColors(firstImageUrl)
      }
    } catch (error) {
      console.error('Failed to fetch movie details:', error)
    }
  }

  const handleMovieClick = (movie) => {
    fetchMovieDetails(movie)
    setThumbnailPage(0) // Reset pagination when selecting new movie
  }

  const extractColors = async (imageUrl) => {
    // For now, use sample colors since we don't have the API set up
    // TODO: Implement actual color extraction
    const sampleColors = [
      '#1a1a1a', '#2d3748', '#4a5568', '#718096', '#a0aec0'
    ]
    setColorPalette(sampleColors)
    
    // Uncomment below when API is ready:
    // try {
    //   const response = await fetch('/api/extract-colors', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ imageUrl })
    //   })
    //   if (response.ok) {
    //     const { colors } = await response.json()
    //     setColorPalette(colors || sampleColors)
    //   }
    // } catch (error) {
    //   console.error('Color extraction failed:', error)
    //   setColorPalette(sampleColors)
    // }
  }

  const handleImageSelection = (index) => {
    setSelectedImageIndex(index)
    const imageUrl = `${CONFIG.TMDB_IMAGE_BASE}${movieImages[index]?.file_path}`
    setSelectedImageUrl(imageUrl)
    extractColors(imageUrl)
  }

  const handleNumberPad = (number) => {
    if (number >= 1 && number <= colorPalette.length) {
      const selectedColor = colorPalette[number - 1]
      console.log(`Selected color ${number}: ${selectedColor}`)
      // Could add color selection logic here
    }
  }

  const handleSelectMovie = () => {
    if (selectedMovie) {
      onMovieSelect(selectedMovie)
      onClose()
    }
  }

  const handleAddToPlaylist = (playlistId) => {
    if (selectedMovie) {
      try {
        addMovieToPlaylist(playlistId, selectedMovie)
        fetchPlaylists() // Refresh playlists
        setShowAddToPlaylist(false)
        // Could add a toast notification here
      } catch (error) {
        console.error('Failed to add movie to playlist:', error)
        // Could show error message
      }
    }
  }

  // Premium takeover animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }

  const headerVariants = {
    hidden: { 
      scale: 0.85, 
      opacity: 0,
      y: -20
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  }

  const panelVariants = {
    hidden: (direction) => ({
      scale: 0.8,
      opacity: 0,
      x: direction === 'left' ? -100 : 100,
      transformOrigin: direction === 'left' ? 'left center' : 'right center'
    }),
    visible: {
      scale: 1,
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    },
    exit: (direction) => ({
      scale: 0.9,
      opacity: 0,
      x: direction === 'left' ? -50 : 50,
      transition: { duration: 0.15 }
    })
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: 10,
      transition: { duration: 0.1 }
    }
  }

  if (!show) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="movie-search-takeover"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="movie-search-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with staggered animation */}
          <motion.div 
            className="movie-search-header"
            variants={headerVariants}
          >
            <motion.div 
              className="movie-search-tabs"
              variants={contentVariants}
            >
              <motion.button
                className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
                variants={contentVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
              </motion.button>
              <motion.button
                className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
                onClick={() => setActiveTab('playlists')}
                variants={contentVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Playlists
              </motion.button>
            </motion.div>
            <div className="header-right">
              {selectedMovie && (
                <>
                  <div className="header-actions">
                    <motion.button 
                      className="header-btn select-btn" 
                      onClick={handleSelectMovie}
                      variants={contentVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Select this movie"
                    >
                      Select
                    </motion.button>
                    
                    <motion.button 
                      className="header-btn playlist-btn" 
                      onClick={() => setShowAddToPlaylist(!showAddToPlaylist)}
                      variants={contentVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Add to playlist"
                    >
                      Playlist
                    </motion.button>
                  </div>
                  
                  <motion.div 
                    className="header-movie-info"
                    variants={contentVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="header-title">{selectedMovie.title}</div>
                    <div className="header-year">{selectedMovie.release_date?.slice(0, 4)}</div>
                  </motion.div>
                </>
              )}
              
              <motion.button 
                className="close-btn" 
                onClick={onClose}
                variants={contentVariants}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
          </motion.div>

          {/* Content with cascading panel animations */}
          <div className="movie-search-content">
            {/* Left Panel - Search/Playlists */}
            <motion.div 
              className="search-panel"
              variants={panelVariants}
              custom="left"
            >
              {activeTab === 'search' && (
                <>
                  <motion.div 
                    className="search-input-container"
                    variants={contentVariants}
                  >
                    <motion.input
                      type="text"
                      placeholder="Search for movies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      autoFocus
                      variants={contentVariants}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="movie-grid"
                    variants={contentVariants}
                  >
                    {loading && (
                      <motion.div 
                        className="loading"
                        variants={contentVariants}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        Searching...
                      </motion.div>
                    )}
                    {(() => {
                      const MOVIES_PER_PAGE = 6  // 2 rows of ~3 movies each
                      const startIndex = searchPage * MOVIES_PER_PAGE
                      const endIndex = startIndex + MOVIES_PER_PAGE
                      const currentMovies = searchResults.slice(startIndex, endIndex)
                      
                      return currentMovies.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        className={`movie-card ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
                        onClick={() => handleMovieClick(movie)}
                        variants={contentVariants}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.0 }}
                        whileTap={{ scale: 0.95 }}
                        layout
                      >
                        <div className="movie-poster">
                          {movie.poster_path ? (
                            <img
                              src={`${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}`}
                              alt={movie.title}
                            />
                          ) : (
                            <div className="no-poster">No Image</div>
                          )}
                        </div>
                      </motion.div>
                      ))
                    })()}
                  </motion.div>
                  
                  {/* Search Pagination */}
                  {searchResults.length > 6 && (
                    <motion.div 
                      className="search-pagination"
                      variants={contentVariants}
                    >
                      <motion.button
                        className="pagination-btn"
                        onClick={() => setSearchPage(Math.max(0, searchPage - 1))}
                        disabled={searchPage === 0}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ‹ Prev
                      </motion.button>
                      
                      <div className="pagination-info">
                        {searchPage + 1}/{Math.ceil(searchResults.length / 6)}
                      </div>
                      
                      <motion.button
                        className="pagination-btn"
                        onClick={() => setSearchPage(Math.min(Math.ceil(searchResults.length / 6) - 1, searchPage + 1))}
                        disabled={searchPage >= Math.ceil(searchResults.length / 6) - 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Next ›
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}

              {activeTab === 'playlists' && (
                <motion.div 
                  className="playlists-panel"
                  variants={contentVariants}
                >
                  <motion.h3 variants={contentVariants}>Your Playlists</motion.h3>
                  {playlists.map((playlist, index) => (
                    <motion.div 
                      key={playlist.id} 
                      className="playlist-item"
                      variants={contentVariants}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <h4>{playlist.name}</h4>
                      {playlist.description && <p>{playlist.description}</p>}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Right Panel - Movie Details */}
            {selectedMovie && (
              <motion.div 
                className="details-panel"
                variants={panelVariants}
                custom="right"
                key={selectedMovie.id}
              >
                <motion.div 
                  className="movie-details"
                  variants={contentVariants}
                >
                  {/* 3-Column Compact Layout */}
                  <motion.div 
                    className="movie-info-grid"
                    variants={contentVariants}
                  >
                    {/* Column 1: 2x2 Metadata */}
                    <motion.div className="movie-meta" variants={contentVariants}>
                      <motion.div className="meta-item" variants={contentVariants}>
                        <div className="meta-label">Runtime</div>
                        <div className="meta-value">{selectedMovie.runtime} min</div>
                      </motion.div>
                      <motion.div className="meta-item" variants={contentVariants}>
                        <div className="meta-label">Rating</div>
                        <div className="meta-value">{selectedMovie.vote_average?.toFixed(1)}/10</div>
                      </motion.div>
                      <motion.div className="meta-item" variants={contentVariants}>
                        <div className="meta-label">Budget</div>
                        <div className="meta-value">
                          {selectedMovie.budget > 0 
                            ? `$${(selectedMovie.budget / 1000000).toFixed(0)}M` 
                            : 'Unknown'
                          }
                        </div>
                      </motion.div>
                      <motion.div className="meta-item" variants={contentVariants}>
                        <div className="meta-label">Language</div>
                        <div className="meta-value">{selectedMovie.original_language?.toUpperCase()}</div>
                      </motion.div>
                    </motion.div>
                    
                    {/* Column 2: Crew List (Vertical) */}
                    <motion.div className="crew-list" variants={contentVariants}>
                      {selectedMovie.credits?.crew && (
                        <>
                          {selectedMovie.credits.crew
                            .filter(person => person.job === 'Director')
                            .slice(0, 1)
                            .map((person, index) => (
                              <motion.div 
                                key={index} 
                                className="crew-member"
                                variants={contentVariants}
                                whileHover={{ scale: 1.02, x: 3 }}
                              >
                                <div className="crew-role">Director</div>
                                <div className="crew-name">{person.name}</div>
                              </motion.div>
                            ))
                          }
                          {selectedMovie.credits.crew
                            .filter(person => 
                              person.job === 'Director of Photography' || 
                              person.job === 'Cinematographer'
                            )
                            .slice(0, 1)
                            .map((person, index) => (
                              <motion.div 
                                key={index} 
                                className="crew-member"
                                variants={contentVariants}
                                whileHover={{ scale: 1.02, x: 3 }}
                              >
                                <div className="crew-role">Cinematographer</div>
                                <div className="crew-name">{person.name}</div>
                              </motion.div>
                            ))
                          }
                          {selectedMovie.credits.crew
                            .filter(person => person.job === 'Production Designer')
                            .slice(0, 1)
                            .map((person, index) => (
                              <motion.div 
                                key={index} 
                                className="crew-member"
                                variants={contentVariants}
                                whileHover={{ scale: 1.02, x: 3 }}
                              >
                                <div className="crew-role">Production Designer</div>
                                <div className="crew-name">{person.name}</div>
                              </motion.div>
                            ))
                          }
                          {selectedMovie.credits.crew
                            .filter(person => person.job === 'Costume Designer')
                            .slice(0, 1)
                            .map((person, index) => (
                              <motion.div 
                                key={index} 
                                className="crew-member"
                                variants={contentVariants}
                                whileHover={{ scale: 1.02, x: 3 }}
                              >
                                <div className="crew-role">Costume Designer</div>
                                <div className="crew-name">{person.name}</div>
                              </motion.div>
                            ))
                          }
                        </>
                      )}
                    </motion.div>

                    {/* Column 3: Synopsis */}
                    <motion.div className="movie-synopsis" variants={contentVariants}>
                      <motion.h3 variants={contentVariants}>Synopsis</motion.h3>
                      <motion.p variants={contentVariants}>{selectedMovie.overview}</motion.p>
                    </motion.div>
                  </motion.div>

                  {/* Image Gallery */}
                  {movieImages.length > 0 && (
                    <motion.div 
                      className="image-preview"
                      variants={contentVariants}
                    >
                      <div className="image-gallery-container">
                        {/* Main Image Preview */}
                        <motion.div 
                          className="image-main-preview"
                          variants={contentVariants}
                        >
                          <motion.div 
                            className="image-gallery"
                            variants={contentVariants}
                            onMouseEnter={() => setShowNumpad(true)}
                            onMouseLeave={() => setShowNumpad(false)}
                          >
                            <motion.img
                              key={selectedImageIndex}
                              src={`${CONFIG.TMDB_IMAGE_BASE}${movieImages[selectedImageIndex]?.file_path}`}
                              alt="Movie backdrop"
                              className="preview-image"
                              initial={{ opacity: 0, scale: 1.05 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4 }}
                            />
                            
                            {/* Color Palette Overlay */}
                            {selectedImageUrl && (
                              <ColorPalette
                                imageUrl={selectedImageUrl}
                                onColorSelect={(color, index) => {
                                  console.log(`Selected color ${index + 1}: ${color}`)
                                  // Could add color selection logic here
                                }}
                              />
                            )}
                          </motion.div>
                        </motion.div>

                        {/* Thumbnail Sidebar */}
                        {movieImages.length > 1 && (
                          <motion.div 
                            className="image-thumbnails-sidebar"
                            variants={contentVariants}
                          >
                            <motion.div 
                              className="image-thumbnails"
                              variants={contentVariants}
                            >
                              {movieImages.map((image, index) => (
                                <motion.div
                                  key={index}
                                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                  onClick={() => handleImageSelection(index)}
                                  variants={contentVariants}
                                  transition={{ delay: index * 0.02 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <img
                                    src={`https://image.tmdb.org/t/p/w300${image.file_path}`}
                                    alt={`Backdrop ${index + 1}`}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Playlist Dropdown in Header */}
                  {showAddToPlaylist && (
                    <motion.div 
                      className="header-playlist-dropdown"
                      variants={contentVariants}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {playlists.map((playlist) => (
                        <motion.button
                          key={playlist.id}
                          className="playlist-option"
                          onClick={() => handleAddToPlaylist(playlist.id)}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          {playlist.name}
                          <span>({playlist.movies?.length || 0} movies)</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MovieSearch