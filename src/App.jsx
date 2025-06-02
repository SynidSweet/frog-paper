import { useState, useEffect } from 'react'
import PaletteContainer from './components/PaletteContainer'
import Background from './components/Background'
import MovieSearch from './components/MovieSearch'
import './App.css'

function App() {
  const [currentMovie, setCurrentMovie] = useState(null)
  const [colors, setColors] = useState(['#000000', '#000000', '#000000'])
  const [colorCount, setColorCount] = useState(6)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [showMovieSearch, setShowMovieSearch] = useState(false)

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('filmPaletteState')
      if (savedState) {
        const state = JSON.parse(savedState)
        
        if (state.colorCount) {
          setColorCount(state.colorCount)
        }
        
        if (state.currentMovie) {
          setCurrentMovie(state.currentMovie)
          setIsDarkTheme(state.paletteTheme)
        }
      }
    } catch (error) {
      console.error('Failed to load saved state:', error)
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentMovie) {
      const state = {
        currentMovie,
        colorCount,
        paletteTheme: isDarkTheme
      }
      localStorage.setItem('filmPaletteState', JSON.stringify(state))
    }
  }, [currentMovie, colorCount, isDarkTheme])

  const handleBackgroundClick = () => {
    setShowMovieSearch(true)
  }

  const handleMovieSelect = (movie) => {
    setCurrentMovie(movie)
    setShowMovieSearch(false)
  }

  return (
    <div className="app">
      <div onClick={handleBackgroundClick} style={{ cursor: 'pointer' }}>
        <Background movie={currentMovie} />
      </div>
      <PaletteContainer
        movie={currentMovie}
        onMovieSelect={setCurrentMovie}
        colors={colors}
        onColorsChange={setColors}
        colorCount={colorCount}
        onColorCountChange={setColorCount}
        isDarkTheme={isDarkTheme}
        onThemeChange={setIsDarkTheme}
      />
      <MovieSearch
        show={showMovieSearch}
        onClose={() => setShowMovieSearch(false)}
        onMovieSelect={handleMovieSelect}
      />
    </div>
  )
}

export default App