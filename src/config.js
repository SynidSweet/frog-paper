const CONFIG = {
    TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY || '26f91966a309626156926d072d3833a0',
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD5c3TPQlrFPp4zmmvhanFfRmNfl_uH1vA',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/original'
}

export default CONFIG