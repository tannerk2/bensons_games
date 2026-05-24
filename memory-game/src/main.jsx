import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage'
import SongsPage from './pages/SongsPage'
import AddSongPage from './pages/AddSongPage'
import CreateGamePage from './pages/CreateGamePage'
import JeopardyPlayPage from './pages/JeopardyPlayPage'
import FillInBlankPage from './pages/FillInBlankPage'
import FlashcardsPage from './pages/FlashcardsPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/songs/new" element={<AddSongPage />} />
        <Route path="/games/create" element={<CreateGamePage />} />
        <Route path="/games/jeopardy/play" element={<JeopardyPlayPage />} />
        <Route path="/games/fill-in-blank/play" element={<FillInBlankPage />} />
        <Route path="/games/flashcards/play" element={<FlashcardsPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
