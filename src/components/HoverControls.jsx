import { motion } from 'framer-motion'

function HoverControls({ colorCount, onColorCountChange, searchQuery, onSearchChange }) {
  const handleColorCountUp = () => {
    if (colorCount < 12) {
      onColorCountChange(colorCount + 1)
    }
  }

  const handleColorCountDown = () => {
    if (colorCount > 3) {
      onColorCountChange(colorCount - 1)
    }
  }

  return (
    <div className="hover-controls">
      <div className="search-section">
        <input
          type="text"
          className="movie-search"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="settings-section">
        <label htmlFor="color-count">Colors: </label>
        <button 
          className="color-count-btn" 
          onClick={handleColorCountDown}
          disabled={colorCount <= 3}
        >
          −
        </button>
        <input
          type="text"
          id="color-count"
          readOnly
          value={colorCount}
        />
        <button 
          className="color-count-btn" 
          onClick={handleColorCountUp}
          disabled={colorCount >= 12}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default HoverControls