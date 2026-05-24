import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSongs, deleteSong } from '../utils/storage'
import './SongLibrary.css'

function SongLibrary() {
  const [songs, setSongs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setSongs(getSongs())
  }, [])

  const handleDelete = (id, title) => {
    if (confirm(`Delete "${title}"?`)) {
      deleteSong(id)
      setSongs(getSongs())
    }
  }

  return (
    <div className="song-library container">
      <Link to="/" className="back-link">← Back to Home</Link>
      <h1 className="page-title">🎵 My Songs</h1>
      
      <div className="library-actions">
        <Link to="/sheet-music" className="btn btn-primary">+ Add New Song</Link>
      </div>

      {songs.length === 0 ? (
        <div className="empty-state">
          <p>No songs saved yet.</p>
          <p>Upload sheet music to get started!</p>
        </div>
      ) : (
        <div className="songs-grid">
          {songs.map(song => (
            <div key={song.id} className="song-card">
              <h3 className="song-card-title">{song.title}</h3>
              <p className="song-card-info">
                {song.verses?.length || 0} sections
              </p>
              <div className="song-card-actions">
                <button className="btn btn-primary" onClick={() => navigate(`/sheet-music/${song.id}`)}>
                  Practice
                </button>
                <button className="btn btn-secondary" onClick={() => navigate(`/sheet-music/${song.id}`)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(song.id, song.title)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SongLibrary
