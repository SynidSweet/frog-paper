import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ImageSelector from './ImageSelector'

function NumberPad({ show, currentCount, onNumberSelect, isDarkTheme, colors, movie, onImageSelect, currentImageIndex }) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const [showNumbers, setShowNumbers] = useState(false)

  // Get the first color for active state, fallback to blue
  const activeColor = colors && colors.length > 0 ? colors[0] : '#007AFF'

  // Calculate if we should use white or black text based on color brightness
  const getTextColor = (hexColor) => {
    if (!hexColor) return 'white'
    
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    // Calculate brightness (0-255)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    
    // Return white for dark colors, black for light colors
    return brightness < 128 ? 'white' : 'black'
  }

  const textColor = getTextColor(activeColor)

  useEffect(() => {
    if (show) {
      // Delay showing numbers until width animation completes
      const timer = setTimeout(() => {
        setShowNumbers(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowNumbers(false)
    }
  }, [show])

  return (
    <div className={`number-pad ${show ? 'show' : ''}`}>
      <div className="number-pad-content">
        <ImageSelector
          movie={movie}
          onImageSelect={onImageSelect}
          currentIndex={currentImageIndex}
          show={showNumbers}
        />
        
        <div className="number-grid">
          {numbers.map((number, index) => (
          <motion.button
            key={number}
            className={`number-button ${currentCount === number ? 'active' : ''}`}
            onClick={() => onNumberSelect(number)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: showNumbers ? 1 : 0,
              scale: showNumbers ? 1 : 0
            }}
            transition={{ 
              duration: 0.15,
              delay: showNumbers ? index * 0.03 : 0,
              ease: "easeOut"
            }}
            whileHover={{ scale: showNumbers ? 1.1 : 1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              backgroundColor: currentCount === number ? activeColor : undefined,
              color: currentCount === number ? textColor : undefined,
              borderColor: currentCount === number ? activeColor : undefined
            }}
          >
            {number}
          </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NumberPad