const STORAGE_KEY = 'memory-game-library'
const SONGS_STORAGE_KEY = 'sheet-music-songs'

export const getGames = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export const getGame = (id) => {
  const games = getGames()
  return games.find(g => g.id === id)
}

export const saveGame = (game) => {
  const games = getGames()
  const existingIndex = games.findIndex(g => g.id === game.id)
  
  if (existingIndex >= 0) {
    games[existingIndex] = { ...game, updatedAt: new Date().toISOString() }
  } else {
    games.push({ ...game, createdAt: new Date().toISOString() })
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
  return game
}

export const deleteGame = (id) => {
  const games = getGames().filter(g => g.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

// Song storage functions
export const getSongs = () => {
  const data = localStorage.getItem(SONGS_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export const getSong = (id) => {
  const songs = getSongs()
  return songs.find(s => s.id === id)
}

export const saveSong = (song) => {
  const songs = getSongs()
  const existingIndex = songs.findIndex(s => s.id === song.id)
  
  if (existingIndex >= 0) {
    songs[existingIndex] = { ...song, updatedAt: new Date().toISOString() }
  } else {
    songs.push({ ...song, createdAt: new Date().toISOString() })
  }
  
  localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs))
  return song
}

export const deleteSong = (id) => {
  const songs = getSongs().filter(s => s.id !== id)
  localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs))
}

export const getGridLayout = (pairs) => {
  const total = pairs * 2
  const layouts = {
    8: { cols: 4, rows: 2 },
    12: { cols: 4, rows: 3 },
    16: { cols: 4, rows: 4 },
    20: { cols: 5, rows: 4 },
    24: { cols: 6, rows: 4 },
  }
  return layouts[total] || { cols: Math.ceil(Math.sqrt(total)), rows: Math.ceil(total / Math.ceil(Math.sqrt(total))) }
}
