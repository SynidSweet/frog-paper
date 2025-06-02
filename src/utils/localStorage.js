// Simple localStorage-based playlist management
const STORAGE_KEYS = {
  USER: 'frog_paper_user',
  PLAYLISTS: 'frog_paper_playlists'
}

const DEFAULT_USER = {
  email: 'caitlin.royse@me.com',
  id: 1
}

const DEFAULT_PLAYLISTS = [
  { id: 1, name: 'Favorites', description: 'My favorite films', userId: 1, movies: [] },
  { id: 2, name: 'Cinematography Study', description: 'Films with exceptional cinematography', userId: 1, movies: [] },
  { id: 3, name: 'Color References', description: 'Films with interesting color palettes', userId: 1, movies: [] }
]

// Initialize localStorage if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER))
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.PLAYLISTS)) {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(DEFAULT_PLAYLISTS))
  }
}

export const getPlaylists = () => {
  initializeStorage()
  const playlists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS)
  return playlists ? JSON.parse(playlists) : DEFAULT_PLAYLISTS
}

export const createPlaylist = (name, description = '') => {
  const playlists = getPlaylists()
  const newPlaylist = {
    id: Date.now(), // Simple ID generation
    name,
    description,
    userId: 1,
    movies: []
  }
  
  playlists.push(newPlaylist)
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists))
  return newPlaylist
}

export const addMovieToPlaylist = (playlistId, movieData) => {
  const playlists = getPlaylists()
  const playlist = playlists.find(p => p.id === playlistId)
  
  if (!playlist) {
    throw new Error('Playlist not found')
  }
  
  // Check if movie already exists
  const exists = playlist.movies.find(m => m.tmdbId === movieData.id)
  if (exists) {
    throw new Error('Movie already in playlist')
  }
  
  playlist.movies.push({
    tmdbId: movieData.id,
    movieData: movieData,
    addedAt: new Date().toISOString()
  })
  
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists))
  return playlist
}

export const removeMovieFromPlaylist = (playlistId, tmdbId) => {
  const playlists = getPlaylists()
  const playlist = playlists.find(p => p.id === playlistId)
  
  if (!playlist) {
    throw new Error('Playlist not found')
  }
  
  playlist.movies = playlist.movies.filter(m => m.tmdbId !== tmdbId)
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists))
  return playlist
}

export const getPlaylistMovies = (playlistId) => {
  const playlists = getPlaylists()
  const playlist = playlists.find(p => p.id === playlistId)
  return playlist ? playlist.movies : []
}