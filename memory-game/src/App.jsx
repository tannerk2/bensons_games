import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GameCreator from './pages/GameCreator'
import GameLibrary from './pages/GameLibrary'
import GamePlay from './pages/GamePlay'
import SheetMusicLearner from './pages/SheetMusicLearner'
import SongLibrary from './pages/SongLibrary'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<GameCreator />} />
          <Route path="/create/:id" element={<GameCreator />} />
          <Route path="/library" element={<GameLibrary />} />
          <Route path="/play/:id" element={<GamePlay />} />
          <Route path="/sheet-music" element={<SheetMusicLearner />} />
          <Route path="/sheet-music/:id" element={<SheetMusicLearner />} />
          <Route path="/song-library" element={<SongLibrary />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
