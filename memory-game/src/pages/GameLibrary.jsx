import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getGames, deleteGame } from '../utils/storage'
import './GameLibrary.css'

function GameLibrary() {
  const [games, setGames] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    setGames(getGames())
  }, [])

  const handleDelete = (id) => {
    deleteGame(id)
    setGames(getGames())
    setDeleteConfirm(null)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="library container">
      <Link to="/" className="back-link">← Back to Home</Link>
      <h1 className="page-title">My Games Library</h1>

      {games.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📚</div>
          <h2>No games yet</h2>
          <p>Create your first custom memory game!</p>
          <Link to="/create" className="btn btn-primary">Create Game</Link>
        </div>
      ) : (
        <div className="games-grid">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <div
                className="game-thumbnail"
                style={{ background: game.themeColor || '#667eea' }}
              >
                <div className="thumbnail-grid">
                  {(game.pairs || game.images || []).slice(0, 4).map((pair, i) => (
                    <div key={i} className="thumb-img">
                      {pair.type === 'text' ? (
                        <span className="thumb-text">{pair.text}</span>
                      ) : (
                        <img
                          src={pair.url}
                          alt=""
                          style={pair.position ? { objectPosition: `${pair.position.x}% ${pair.position.y}%` } : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="game-info">
                <h3 className="game-name">{game.name}</h3>
                <div className="game-meta">
                  <span>{game.pairCount} pairs</span>
                  <span>•</span>
                  <span>{formatDate(game.createdAt)}</span>
                </div>
              </div>

              <div className="game-actions">
                <Link to={`/play/${game.id}`} className="btn btn-primary">Play</Link>
                <Link to={`/create/${game.id}`} className="btn btn-secondary">Edit</Link>
                <button
                  className="btn btn-danger"
                  onClick={() => setDeleteConfirm(game.id)}
                >
                  Delete
                </button>
              </div>

              {deleteConfirm === game.id && (
                <div className="delete-confirm">
                  <p>Delete "{game.name}"?</p>
                  <div className="confirm-actions">
                    <button className="btn btn-danger" onClick={() => handleDelete(game.id)}>
                      Yes, Delete
                    </button>
                    <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="library-footer">
        <Link to="/create" className="btn btn-primary">+ Create New Game</Link>
      </div>
    </div>
  )
}

export default GameLibrary
