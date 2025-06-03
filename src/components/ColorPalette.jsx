import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ColorPalette({ imageUrl, onColorSelect, className = '', colors: externalColors }) {
  const [colors, setColors] = useState(externalColors || [])

  // Extract colors using Vibrant.js (always 6 colors)
  const extractColors = async (url) => {
    try {
      // Use same CORS proxy as main app
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`
      
      // Use Vibrant.js like the main app
      const palette = await window.Vibrant.from(proxyUrl).quality(1).getPalette()
      
      // Extract all 6 swatches in order
      const swatches = [
        palette.Vibrant,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.Muted,
        palette.DarkMuted,
        palette.LightMuted
      ].filter(swatch => swatch !== null)

      // Sort by population (same as main app)
      swatches.sort((a, b) => b.population - a.population)

      // Extract all available colors (up to 6)
      const extractedColors = swatches.map(swatch => swatch.hex)

      // Always show all extracted colors, fallback if none
      const finalColors = extractedColors.length > 0 ? extractedColors : generateFallbackColors(url)
      setColors(finalColors)
      return finalColors
    } catch (error) {
      console.error('Vibrant color extraction failed:', error)
      return generateFallbackColors(url)
    }
  }
  
  // Helper function (same as main app)
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }
  
  // Fallback color generation (always 6 colors)
  const generateFallbackColors = (url) => {
    const cinematicPalettes = [
      ['#FF6B35', '#F7931E', '#3A86FF', '#8338EC', '#FF006E', '#1A1A1A'],
      ['#1A237E', '#283593', '#3949AB', '#5C6BC0', '#7986CB', '#E8EAF6'],
      ['#FFD60A', '#FFB700', '#FCA311', '#FB8500', '#E85D75', '#2D1B07'],
      ['#00FF41', '#008F11', '#003B00', '#1C1C1C', '#0D7377', '#41A317'],
      ['#F4A460', '#CD853F', '#8B4513', '#D2691E', '#F5DEB3', '#8B7355']
    ]
    
    // Use URL hash to pick consistent palette per image
    const filename = url.split('/').pop().split('.')[0]
    let hash = 0
    for (let i = 0; i < filename.length; i++) {
      hash = ((hash << 5) - hash) + filename.charCodeAt(i)
      hash = hash & hash
    }
    
    const paletteIndex = Math.abs(hash) % cinematicPalettes.length
    const palette = cinematicPalettes[paletteIndex]
    
    setColors(palette)
    return palette
  }

  useEffect(() => {
    if (externalColors) {
      // Use externally provided colors (for main app)
      setColors(externalColors)
    } else if (imageUrl) {
      // Extract colors from image (for overlay) - always 6 colors
      extractColors(imageUrl)
    }
  }, [imageUrl, externalColors])

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
      </div>
    </motion.div>
  )
}

export default ColorPalette