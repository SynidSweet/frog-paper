let currentMovie = null;
let searchTimeout = null;

// DOM Elements
const background = document.getElementById('background');
const colorPalette = document.getElementById('color-palette');
const paletteContainer = document.getElementById('palette-container');
const movieTitle = document.getElementById('movie-title');
const movieInfo = document.getElementById('movie-info');
const movieSearch = document.getElementById('movie-search');
const movieGallery = document.getElementById('movie-gallery');
const movieCards = document.getElementById('movie-cards');
const closeGallery = document.querySelector('.close-gallery');
const colorCount = document.getElementById('color-count');
const colorCountUp = document.getElementById('color-count-up');
const colorCountDown = document.getElementById('color-count-down');

// Event Listeners
movieSearch.addEventListener('input', handleSearch);
movieSearch.addEventListener('focus', () => {
    if (movieSearch.value.length >= 2) {
        showMovieGallery();
    }
});
closeGallery.addEventListener('click', hideMovieGallery);
document.addEventListener('click', (e) => {
    if (!movieGallery.contains(e.target) && e.target !== movieSearch) {
        hideMovieGallery();
    }
});
// Color count button handlers
colorCountUp.addEventListener('click', () => {
    const currentValue = parseInt(colorCount.value);
    if (currentValue < 12) {
        colorCount.value = currentValue + 1;
        updateColorCount();
    }
});

colorCountDown.addEventListener('click', () => {
    const currentValue = parseInt(colorCount.value);
    if (currentValue > 3) {
        colorCount.value = currentValue - 1;
        updateColorCount();
    }
});

function updateColorCount() {
    if (currentMovie && currentMovie.backdrop_path) {
        const imageUrl = `${CONFIG.TMDB_IMAGE_BASE}${currentMovie.backdrop_path}`;
        extractColorsFromImage(imageUrl);
    }
    saveAppState();
}


async function handleSearch(e) {
    const query = e.target.value;
    
    if (query.length < 2) {
        autocompleteResults.style.display = 'none';
        return;
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `${CONFIG.TMDB_BASE_URL}/search/movie?api_key=${CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            displayAutocomplete(data.results.slice(0, 5));
        } catch (error) {
            console.error('Search error:', error);
        }
    }, 300);
}

function displayAutocomplete(movies) {
    movieCards.innerHTML = '';
    
    if (movies.length === 0) {
        hideMovieGallery();
        return;
    }
    
    showMovieGallery();
    
    movies.forEach((movie, index) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2NjYyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiLz48L3N2Zz4=';
        
        card.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}">
            <div class="movie-card-info">
                <h4 class="movie-card-title">${movie.title}</h4>
                <p class="movie-card-year">${movie.release_date ? movie.release_date.split('-')[0] : ''}</p>
            </div>
        `;
        
        card.addEventListener('click', () => selectMovie(movie));
        movieCards.appendChild(card);
        
        // Animate in with staggered delay
        setTimeout(() => {
            card.classList.add('animate-in');
        }, index * 100);
    });
}

function showMovieGallery() {
    movieGallery.classList.add('active');
}

function hideMovieGallery() {
    movieGallery.classList.remove('active');
    movieCards.innerHTML = '';
}

async function selectMovie(movie) {
    currentMovie = movie;
    hideMovieGallery();
    movieSearch.value = '';
    
    // Update background
    if (movie.backdrop_path) {
        const imageUrl = `${CONFIG.TMDB_IMAGE_BASE}${movie.backdrop_path}`;
        background.style.backgroundImage = `url(${imageUrl})`;
        
        // Extract colors using Vibrant.js
        extractColorsFromImage(imageUrl);
    }
    
    // Update title with AI-selected font
    updateTitle(movie.title);
    
    // Fetch additional movie details
    fetchMovieDetails(movie.id);
    
    // Save to localStorage
    saveAppState();
}

async function extractColorsFromImage(imageUrl) {
    try {
        // Use a proxy service for CORS issues in local development
        // In production wallpaper apps, this won't be needed
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
        
        Vibrant.from(proxyUrl)
            .quality(1)
            .getPalette()
            .then(palette => {
                displayExtractedColors(palette);
            })
            .catch(err => {
                console.error('Color extraction failed:', err);
                // Fallback to curated palettes
                displayFallbackPalette();
            });
    } catch (error) {
        console.error('Vibrant.js error:', error);
        displayFallbackPalette();
    }
}

function displayExtractedColors(palette) {
    const numColors = parseInt(colorCount.value);
    colorPalette.innerHTML = '';
    
    // Get all available swatches from Vibrant
    const swatches = [
        palette.Vibrant,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.Muted,
        palette.DarkMuted,
        palette.LightMuted
    ].filter(swatch => swatch !== null);
    
    // Sort by population (prominence in image)
    swatches.sort((a, b) => b.population - a.population);
    
    // If we need more colors, generate variations
    const colors = [];
    swatches.forEach(swatch => {
        if (swatch) {
            colors.push(swatch.hex);
            // Add slightly lighter/darker variations if needed
            if (colors.length < numColors) {
                const rgb = swatch.rgb;
                // Lighter variation
                colors.push(rgbToHex(
                    Math.min(255, rgb[0] + 30),
                    Math.min(255, rgb[1] + 30),
                    Math.min(255, rgb[2] + 30)
                ));
            }
        }
    });
    
    // Display the colors
    colors.slice(0, numColors).forEach(hexColor => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hexColor;
        swatch.addEventListener('click', () => {
            navigator.clipboard.writeText(hexColor);
        });
        colorPalette.appendChild(swatch);
    });
    
    // Determine if palette is dark or light
    updatePaletteTheme(colors);
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function displayFallbackPalette() {
    // Curated cinematic palettes as fallback
    const cinematicPalettes = [
        ['#FF6B35', '#F7931E', '#3A86FF', '#8338EC', '#FF006E'],
        ['#1A237E', '#283593', '#3949AB', '#5C6BC0', '#7986CB'],
        ['#FFD60A', '#FFB700', '#FCA311', '#FB8500', '#E85D75'],
        ['#00FF41', '#008F11', '#003B00', '#1C1C1C', '#0D7377'],
        ['#F4A460', '#CD853F', '#8B4513', '#D2691E', '#F5DEB3']
    ];
    
    const palette = cinematicPalettes[Math.floor(Math.random() * cinematicPalettes.length)];
    const numColors = parseInt(colorCount.value);
    
    colorPalette.innerHTML = '';
    palette.slice(0, numColors).forEach(hexColor => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hexColor;
        swatch.addEventListener('click', () => {
            navigator.clipboard.writeText(hexColor);
        });
        colorPalette.appendChild(swatch);
    });
    
    // Update theme for fallback palettes too
    updatePaletteTheme(palette);
}

async function updateTitle(title) {
    movieTitle.textContent = title;
    
    try {
        // Call Gemini API for font suggestion
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Suggest a Google Font that would be perfect for displaying the movie title "${title}". Consider the movie's genre, era, and mood. Respond with ONLY the exact Google Font name, nothing else. Examples: "Bebas Neue", "Playfair Display", "Montserrat"`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        const fontName = data.candidates[0].content.parts[0].text.trim();
        
        // Load the font dynamically
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700;900&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        // Apply the font after a short delay to ensure it's loaded
        setTimeout(() => {
            movieTitle.style.fontFamily = `'${fontName}', sans-serif`;
        }, 100);
        
    } catch (error) {
        console.error('Font selection error:', error);
        // Fallback to a nice default
        movieTitle.style.fontFamily = "'Playfair Display', serif";
    }
}

// Fetch detailed movie information including crew
async function fetchMovieDetails(movieId) {
    try {
        // Fetch movie details and credits in parallel
        const [detailsResponse, creditsResponse] = await Promise.all([
            fetch(`${CONFIG.TMDB_BASE_URL}/movie/${movieId}?api_key=${CONFIG.TMDB_API_KEY}`),
            fetch(`${CONFIG.TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${CONFIG.TMDB_API_KEY}`)
        ]);
        
        const details = await detailsResponse.json();
        const credits = await creditsResponse.json();
        
        // Find director and cinematographer
        const director = credits.crew.find(person => person.job === 'Director');
        const dop = credits.crew.find(person => 
            person.job === 'Director of Photography' || 
            person.job === 'Cinematographer' ||
            person.job === 'Cinematography'
        );
        
        // Update UI with movie details
        document.querySelector('#movie-director .value').textContent = director ? director.name : '—';
        document.querySelector('#movie-dop .value').textContent = dop ? dop.name : '—';
        document.querySelector('#movie-year .value').textContent = details.release_date ? details.release_date.split('-')[0] : '—';
        document.querySelector('#movie-runtime .value').textContent = details.runtime ? `${details.runtime} min` : '—';
        
    } catch (error) {
        console.error('Failed to fetch movie details:', error);
    }
}

// Update palette container theme based on colors
function updatePaletteTheme(colors) {
    if (colors.length === 0) return;
    
    // Calculate average brightness of the palette
    let totalBrightness = 0;
    colors.forEach(hex => {
        const rgb = hexToRgb(hex);
        if (rgb) {
            // Calculate relative luminance
            const brightness = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
            totalBrightness += brightness;
        }
    });
    
    const avgBrightness = totalBrightness / colors.length;
    
    // If palette has dark colors, use dark theme (white text on dark bg)
    // If palette has bright colors, use light theme (dark text on light bg)
    if (avgBrightness < 128) {
        paletteContainer.classList.add('dark-theme');
    } else {
        paletteContainer.classList.remove('dark-theme');
    }
}

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Save app state to localStorage
function saveAppState() {
    const state = {
        currentMovie,
        colorCount: colorCount.value,
        paletteTheme: paletteContainer.classList.contains('dark-theme')
    };
    localStorage.setItem('filmPaletteState', JSON.stringify(state));
}

// Load app state from localStorage
function loadAppState() {
    try {
        const savedState = localStorage.getItem('filmPaletteState');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Restore color count
            if (state.colorCount) {
                colorCount.value = state.colorCount;
            }
            
            // Restore movie if available
            if (state.currentMovie) {
                currentMovie = state.currentMovie;
                
                // Update background
                if (currentMovie.backdrop_path) {
                    const imageUrl = `${CONFIG.TMDB_IMAGE_BASE}${currentMovie.backdrop_path}`;
                    background.style.backgroundImage = `url(${imageUrl})`;
                    extractColorsFromImage(imageUrl);
                }
                
                // Update title
                updateTitle(currentMovie.title);
                
                // Fetch movie details
                fetchMovieDetails(currentMovie.id);
                
                // Restore theme
                if (state.paletteTheme) {
                    paletteContainer.classList.add('dark-theme');
                } else {
                    paletteContainer.classList.remove('dark-theme');
                }
            }
        }
    } catch (error) {
        console.error('Failed to load saved state:', error);
    }
}

// Initialize with saved state or default
window.addEventListener('load', () => {
    loadAppState();
    if (!currentMovie) {
        movieTitle.textContent = 'Click to search';
    }
});