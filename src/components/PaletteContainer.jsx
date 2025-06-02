import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MovieInfo from './MovieInfo'
import ColorPalette from './ColorPalette'
import NumberPad from './NumberPad'
import ImageSelector from './ImageSelector'
import CONFIG from '../config'

function PaletteContainer({ 
  movie, 
  onMovieSelect, 
  colors, 
  onColorsChange, 
  colorCount, 
  onColorCountChange, 
  isDarkTheme, 
  onThemeChange 
}) {
  const [showNumberPad, setShowNumberPad] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageCache, setImageCache] = useState(new Map())
  const [colorCache, setColorCache] = useState(new Map())

  // Extract colors when movie, image index, or color count changes
  useEffect(() => {
    if (movie?.backdrop_path) {
      const imageKey = getImageKey(currentImageIndex)
      if (imageKey) {
        extractColorsFromImage(imageKey)
      }
    }
  }, [movie, currentImageIndex, colorCount])

  // Reset image index when movie changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [movie])

  const getImageKey = (imageIndex) => {
    if (!movie) return null
    
    // For now, just use the movie's backdrop_path
    // This will be enhanced when we have multiple images
    return `${CONFIG.TMDB_IMAGE_BASE}${movie.backdrop_path}`
  }

  const extractColorsFromImage = async (imageUrl) => {
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`
      
      const palette = await window.Vibrant.from(proxyUrl).quality(1).getPalette()
      
      const swatches = [
        palette.Vibrant,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.Muted,
        palette.DarkMuted,
        palette.LightMuted
      ].filter(swatch => swatch !== null)

      // Sort by population
      swatches.sort((a, b) => b.population - a.population)

      // Generate colors array
      const extractedColors = []
      swatches.forEach(swatch => {
        if (swatch) {
          extractedColors.push(swatch.hex)
          // Add variations if needed
          if (extractedColors.length < colorCount) {
            const rgb = swatch.rgb
            extractedColors.push(rgbToHex(
              Math.min(255, rgb[0] + 30),
              Math.min(255, rgb[1] + 30),
              Math.min(255, rgb[2] + 30)
            ))
          }
        }
      })

      const finalColors = extractedColors.slice(0, colorCount)
      onColorsChange(finalColors)

      // Update theme based on color brightness
      updateTheme(finalColors)
    } catch (error) {
      console.error('Color extraction failed:', error)
      displayFallbackPalette()
    }
  }

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const displayFallbackPalette = () => {
    const cinematicPalettes = [
      ['#FF6B35', '#F7931E', '#3A86FF', '#8338EC', '#FF006E'],
      ['#1A237E', '#283593', '#3949AB', '#5C6BC0', '#7986CB'],
      ['#FFD60A', '#FFB700', '#FCA311', '#FB8500', '#E85D75'],
      ['#00FF41', '#008F11', '#003B00', '#1C1C1C', '#0D7377'],
      ['#F4A460', '#CD853F', '#8B4513', '#D2691E', '#F5DEB3']
    ]
    
    const palette = cinematicPalettes[Math.floor(Math.random() * cinematicPalettes.length)]
    const finalColors = palette.slice(0, colorCount)
    onColorsChange(finalColors)
    updateTheme(finalColors)
  }

  const updateTheme = (colorArray) => {
    if (colorArray.length === 0) return
    
    let totalBrightness = 0
    colorArray.forEach(hex => {
      const rgb = hexToRgb(hex)
      if (rgb) {
        const brightness = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b)
        totalBrightness += brightness
      }
    })
    
    const avgBrightness = totalBrightness / colorArray.length
    onThemeChange(avgBrightness < 128)
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const handleNumberSelect = (number) => {
    if (number >= 1 && number <= 9) {
      onColorCountChange(number)
    }
    // Don't hide the number pad on click - keep it visible
  }

  const handleImageSelect = (index) => {
    setCurrentImageIndex(index)
  }

  return (
    <motion.div
      className={`palette-container ${isDarkTheme ? 'dark-theme' : ''}`}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onMouseEnter={() => setShowNumberPad(true)}
      onMouseLeave={() => setShowNumberPad(false)}
    >
      <div className="main-palette-content">
        <MovieInfo movie={movie} />
        
        <NumberPad
          show={showNumberPad}
          currentCount={colorCount}
          onNumberSelect={handleNumberSelect}
          isDarkTheme={isDarkTheme}
          colors={colors}
          movie={movie}
          onImageSelect={handleImageSelect}
          currentImageIndex={currentImageIndex}
        />
        
        <ColorPalette colors={colors} />
      </div>
    </motion.div>
  )
}

export default PaletteContainer