import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <h1 className="home-title">🎴 Learning Games</h1>
        <p className="home-subtitle">Interactive tools for learning and memorization</p>
        
        <div className="home-actions">
          <Link to="/create" className="home-btn home-btn-create">
            <span className="btn-icon">✨</span>
            <span className="btn-text">Create Memory Game</span>
            <span className="btn-desc">Design a custom matching game</span>
          </Link>
          
          <Link to="/library" className="home-btn home-btn-library">
            <span className="btn-icon">📚</span>
            <span className="btn-text">My Games Library</span>
            <span className="btn-desc">Play your saved games</span>
          </Link>
          
          <Link to="/sheet-music" className="home-btn home-btn-music">
            <span className="btn-icon">🎵</span>
            <span className="btn-text">Sheet Music Learner</span>
            <span className="btn-desc">Memorize song lyrics from sheet music</span>
          </Link>
          
          <Link to="/song-library" className="home-btn home-btn-songs">
            <span className="btn-icon">🎤</span>
            <span className="btn-text">My Songs</span>
            <span className="btn-desc">Practice your saved songs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
