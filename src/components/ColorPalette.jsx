import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ColorPalette({ imageUrl, onColorSelect, className = '', colors: externalColors }) {
  const [colors, setColors] = useState(externalColors || [])
  const [colorCount, setColorCount] = useState(5)
  const [showNumpad, setShowNumpad] = useState(false)

  // Extract colors from image (placeholder implementation)
  const extractColors = async (url, count = 5) => {
    // TODO: Implement actual color extraction from image
    // For now, generate sample colors based on the image URL hash
    const hash = url.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const sampleColors = []
    for (let i = 0; i < count; i++) {
      const hue = (Math.abs(hash) + i * 60) % 360
      const saturation = 40 + (i * 15) % 40
      const lightness = 25 + (i * 20) % 50
      sampleColors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
    }
    setColors(sampleColors)
  }

  useEffect(() => {
    if (externalColors) {
      // Use externally provided colors (for main app)
      setColors(externalColors)
    } else if (imageUrl) {
      // Extract colors from image (for overlay)
      extractColors(imageUrl, colorCount)
    }
  }, [imageUrl, colorCount, externalColors])

  const handleNumberPad = (number) => {
    if (number >= 1 && number <= 9) {
      setColorCount(number)
    }
  }

  const handleColorClick = (color, index) => {
    if (onColorSelect) {
      onColorSelect(color, index)
    } else {
      // Default behavior: copy to clipboard
      navigator.clipboard.writeText(color)
    }
  }

  // If external colors are provided, use original style
  if (externalColors) {
    return (
      <div className="color-palette">
        {colors.map((color, index) => (
          <motion.div
            key={`${color}-${index}`}
            className="color-swatch"
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color, index)}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ 
              y: -4,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>
    )
  }

  // New overlay style for image preview
  return (
    <motion.div
      className={`color-palette-overlay ${className}`}
      drag
      dragMomentum={false}
      onMouseEnter={() => setShowNumpad(true)}
      onMouseLeave={() => setShowNumpad(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Color Swatches */}
      <div className="palette-content">
        <div className="palette-swatches">
          {colors.map((color, index) => (
            <motion.div
              key={`${color}-${index}`}
              className="palette-swatch-overlay"
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color, index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </div>

        {/* Number Pad */}
        <AnimatePresence>
          {showNumpad && (
            <motion.div
              className="palette-numpad"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="palette-numpad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    className="palette-numpad-btn"
                    onClick={() => handleNumberPad(num)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ColorPalette