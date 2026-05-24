import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'

// ================== HOME PAGE ==================
const gameTypes = [
  { id: "jeopardy", name: "Jeopardy", description: "Quiz-style game with categories and points", color: "#4A90D9", emoji: "🏆", games: 3 },
  { id: "fill-in-blank", name: "Fill in the Blank", description: "Complete the missing lyrics", color: "#FF7B54", emoji: "✏️", games: 5 },
  { id: "verse-order", name: "Verse Order", description: "Put verses in the correct sequence", color: "#FFD93D", emoji: "📜", games: 2 },
  { id: "lyric-match", name: "Lyric Match", description: "Match line beginnings to endings", color: "#6BCB77", emoji: "🔗", games: 4 },
  { id: "flashcards", name: "Flashcards", description: "Study cards for memorization", color: "#9B59B6", emoji: "📇", games: 6 },
  { id: "bingo", name: "Song Bingo", description: "Fun group activity with lyrics", color: "#E91E63", emoji: "🎯", games: 2 },
]

function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', borderBottom: '4px solid rgba(74, 144, 217, 0.2)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #4A90D9, #FF7B54)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 700 }}>♪</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', margin: 0 }}>HymnPlay</h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Learn songs through games</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '8px' }}>
          <Link to="/songs" style={{ padding: '10px 20px', borderRadius: '12px', color: '#2D3748', textDecoration: 'none', fontWeight: 600, background: '#F7F4EF' }}>Songs</Link>
          <Link to="/games/create" style={{ padding: '10px 20px', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: 600, background: '#4A90D9' }}>+ Create Game</Link>
        </nav>
      </header>

      <section style={{ background: 'linear-gradient(180deg, rgba(74, 144, 217, 0.08) 0%, #FFF9F0 100%)', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', padding: '10px 20px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, color: '#4A90D9', marginBottom: '24px', boxShadow: '0 4px 20px rgba(74, 144, 217, 0.15)' }}>
            <span style={{ fontSize: '18px' }}>✨</span> Making hymn learning fun!
          </div>
          <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#2D3748', marginBottom: '20px', lineHeight: 1.1 }}>
            Learn Your Favorite<br />
            <span style={{ background: 'linear-gradient(90deg, #4A90D9, #FF7B54)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Songs Through Play</span>
          </h2>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Create custom games from any hymn or song. Perfect for Sunday school, family devotions, or personal study.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/games/create" style={{ background: 'linear-gradient(135deg, #4A90D9, #3A7BC8)', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(74, 144, 217, 0.35)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎮</span> Create a Game
            </Link>
            <Link to="/songs" style={{ background: 'white', color: '#2D3748', padding: '16px 32px', borderRadius: '16px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎵</span> Browse Songs
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 16px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#2D3748', margin: 0 }}>Choose a Game Type</h3>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>6 game types available</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {gameTypes.map((game) => (
              <Link key={game.id} to={`/games/${game.id}/play`} style={{ 
                background: 'white', 
                borderRadius: '24px', 
                padding: '28px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', 
                textDecoration: 'none', 
                border: '2px solid transparent',
                transition: 'all 0.2s',
                display: 'block'
              }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: `linear-gradient(135deg, ${game.color}, ${game.color}dd)`, 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '20px', 
                  fontSize: '28px',
                  boxShadow: `0 8px 20px ${game.color}40`
                }}>{game.emoji}</div>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#2D3748', marginBottom: '8px' }}>{game.name}</h4>
                <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '20px', lineHeight: 1.6 }}>{game.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', background: '#F7F4EF', padding: '6px 14px', borderRadius: '9999px', fontWeight: 600, color: '#6B7280' }}>{game.games} games saved</span>
                  <span style={{ color: '#4A90D9', fontWeight: 600, fontSize: '14px' }}>Play →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 16px 64px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #4A90D9 0%, #FF7B54 100%)', borderRadius: '32px', padding: '48px', color: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>12</div>
                <div style={{ opacity: 0.9, fontSize: '15px', fontWeight: 500 }}>Songs Added</div>
              </div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>22</div>
                <div style={{ opacity: 0.9, fontSize: '15px', fontWeight: 500 }}>Games Created</div>
              </div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>48</div>
                <div style={{ opacity: 0.9, fontSize: '15px', fontWeight: 500 }}>Games Played</div>
              </div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>6</div>
                <div style={{ opacity: 0.9, fontSize: '15px', fontWeight: 500 }}>Game Types</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '32px 16px', borderTop: '1px solid #E8E0D5', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
        <p style={{margin: 0}}>HymnPlay - Making hymn learning fun for kids and families</p>
      </footer>
    </div>
  )
}

// ================== SONGS PAGE ==================
const sampleSongs = [
  { id: 1, title: "Amazing Grace", verses: 5, lastUsed: "2 days ago" },
  { id: 2, title: "Holy, Holy, Holy", verses: 4, lastUsed: "1 week ago" },
  { id: 3, title: "Great Is Thy Faithfulness", verses: 3, lastUsed: "3 days ago" },
  { id: 4, title: "How Great Thou Art", verses: 4, lastUsed: "Yesterday" },
  { id: 5, title: "Be Thou My Vision", verses: 5, lastUsed: "5 days ago" },
]

function SongsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #E8E0D5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#4A90D9', fontWeight: 600 }}>← Back</Link>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', margin: 0 }}>Song Library</h1>
        </div>
        <Link to="/songs/new" style={{ padding: '10px 20px', borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: 600, background: '#6BCB77' }}>+ Add Song</Link>
      </header>

      <main style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid #E8E0D5' }}>
          <span style={{ color: '#9CA3AF' }}>🔍</span>
          <input type="text" placeholder="Search songs..." style={{ border: 'none', outline: 'none', flex: 1, fontSize: '16px', background: 'transparent' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sampleSongs.map((song) => (
            <div key={song.id} style={{ background: 'white', borderRadius: '20px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #FFD93D, #FF7B54)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎵</div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#2D3748', margin: '0 0 4px 0' }}>{song.title}</h3>
                  <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>{song.verses} verses • Used {song.lastUsed}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '8px 16px', borderRadius: '10px', border: '2px solid #E8E0D5', background: 'white', color: '#6B7280', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                <button style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#4A90D9', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Create Game</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ================== ADD SONG PAGE ==================
function AddSongPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #E8E0D5', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/songs" style={{ textDecoration: 'none', color: '#4A90D9', fontWeight: 600 }}>← Back</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', margin: 0 }}>Add New Song</h1>
      </header>

      <main style={{ padding: '32px 24px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#2D3748', marginBottom: '8px' }}>Song Title</label>
            <input type="text" placeholder="e.g. Amazing Grace" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #E8E0D5', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#2D3748' }}>Verses</label>
              <button style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#4A90D9', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>+ Add Verse</button>
            </div>
            
            <div style={{ background: '#F7F4EF', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ background: '#4A90D9', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>Verse 1</span>
              </div>
              <textarea placeholder="Enter verse lyrics..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E8E0D5', fontSize: '15px', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}></textarea>
            </div>

            <div style={{ background: '#F7F4EF', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ background: '#FF7B54', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>Chorus</span>
              </div>
              <textarea placeholder="Enter chorus lyrics (optional)..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #E8E0D5', fontSize: '15px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}></textarea>
            </div>
          </div>

          <button style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #6BCB77, #4CAF50)', color: 'white', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Save Song</button>
        </div>
      </main>
    </div>
  )
}

// ================== CREATE GAME PAGE ==================
function CreateGamePage() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #E8E0D5', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#4A90D9', fontWeight: 600 }}>← Back</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', margin: 0 }}>Create a Game</h1>
      </header>

      <main style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: step >= s ? '#4A90D9' : '#E8E0D5',
                color: step >= s ? 'white' : '#9CA3AF',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700
              }}>{s}</div>
              {s < 3 && <div style={{ width: '60px', height: '4px', background: step > s ? '#4A90D9' : '#E8E0D5', borderRadius: '2px' }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', textAlign: 'center', marginBottom: '32px' }}>Choose a Game Type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {gameTypes.map((game) => (
                <button key={game.id} onClick={() => { setSelectedType(game.id); setStep(2); }} style={{ 
                  background: 'white', 
                  borderRadius: '20px', 
                  padding: '24px', 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)', 
                  border: selectedType === game.id ? `3px solid ${game.color}` : '3px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}>
                  <div style={{ 
                    width: '52px', 
                    height: '52px', 
                    background: game.color, 
                    borderRadius: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '16px', 
                    fontSize: '24px'
                  }}>{game.emoji}</div>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#2D3748', marginBottom: '6px' }}>{game.name}</h4>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>{game.description}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', textAlign: 'center', marginBottom: '32px' }}>Select Songs</h2>
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              {sampleSongs.slice(0, 3).map((song) => (
                <label key={song.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', cursor: 'pointer', background: '#F7F4EF', marginBottom: '12px' }}>
                  <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                  <div style={{ width: '40px', height: '40px', background: '#FFD93D', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2D3748' }}>{song.title}</div>
                    <div style={{ fontSize: '13px', color: '#9CA3AF' }}>{song.verses} verses</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setStep(1)} style={{ padding: '14px 28px', borderRadius: '12px', border: '2px solid #E8E0D5', background: 'white', color: '#6B7280', fontWeight: 600, cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(3)} style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', background: '#4A90D9', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Continue</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', textAlign: 'center', marginBottom: '32px' }}>Configure Settings</h2>
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#2D3748', marginBottom: '8px' }}>Game Name</label>
                <input type="text" placeholder="e.g. Sunday School Jeopardy" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #E8E0D5', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#2D3748', marginBottom: '8px' }}>Difficulty</label>
                <select style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #E8E0D5', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}>
                  <option>Easy (fewer blanks)</option>
                  <option>Medium</option>
                  <option>Hard (more blanks)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setStep(2)} style={{ padding: '14px 28px', borderRadius: '12px', border: '2px solid #E8E0D5', background: 'white', color: '#6B7280', fontWeight: 600, cursor: 'pointer' }}>Back</button>
              <button style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6BCB77, #4CAF50)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Create Game</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ================== JEOPARDY PLAY PAGE ==================
function JeopardyPlayPage() {
  const categories = ["Amazing Grace", "Holy Holy Holy", "Great Is Thy", "Be Thou My Vision"]
  const points = [100, 200, 300, 400, 500]
  const [selectedCell, setSelectedCell] = useState(null)
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1a6e 0%, #0d0d4a 100%)', color: 'white' }}>
      <header style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>← Exit Game</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFD93D', margin: 0, letterSpacing: '2px' }}>HYMN JEOPARDY</h1>
        <div></div>
      </header>
      
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4A90D9, #3A7BC8)', padding: '12px 32px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(74, 144, 217, 0.4)' }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Team Blue</div>
            <div style={{ fontWeight: 800, fontSize: '32px' }}>1,200</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #FF7B54, #E86A45)', padding: '12px 32px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(255, 123, 84, 0.4)' }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Team Orange</div>
            <div style={{ fontWeight: 800, fontSize: '32px' }}>800</div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '900px', margin: '0 auto' }}>
          {categories.map((cat, i) => (
            <div key={i} style={{ background: '#0d0d4a', padding: '16px 8px', borderRadius: '12px', textAlign: 'center', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</div>
          ))}
          {points.map((p) => categories.map((_, i) => (
            <button key={`${p}-${i}`} onClick={() => setSelectedCell(`${p}-${i}`)} style={{ 
              background: selectedCell === `${p}-${i}` ? '#333' : 'linear-gradient(180deg, #1a1a8e 0%, #0d0d6e 100%)', 
              border: '2px solid #2a2a9e', 
              padding: '28px 16px', 
              borderRadius: '12px', 
              color: '#FFD93D', 
              fontWeight: 800, 
              fontSize: '28px', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>${p}</button>
          )))}
        </div>
      </div>
    </div>
  )
}

// ================== FILL IN BLANK PAGE ==================
function FillInBlankPage() {
  const [answers, setAnswers] = useState({})
  
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '3px solid #FFE4D9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#FF7B54', fontWeight: 600 }}>← Exit</Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FF7B54', margin: 0 }}>Fill in the Blank</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0 0' }}>Amazing Grace - Verse 1</p>
        </div>
        <div style={{ background: '#FFE4D9', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, color: '#FF7B54', fontSize: '14px' }}>2 / 5</div>
      </header>
      
      <main style={{ padding: '40px 24px', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '28px', padding: '40px', boxShadow: '0 8px 32px rgba(255, 123, 84, 0.12)', marginBottom: '32px', border: '3px solid #FFE4D9' }}>
          <div style={{ fontSize: '26px', lineHeight: 2, color: '#2D3748', textAlign: 'center' }}>
            Amazing <span style={{ background: 'linear-gradient(180deg, #FFE4D9 0%, #FFD4C4 100%)', padding: '6px 20px', borderRadius: '12px', color: '#FF7B54', fontWeight: 600, borderBottom: '3px solid #FF7B54' }}>_____</span> how sweet the sound,<br />
            That saved a <span style={{ background: 'linear-gradient(180deg, #FFE4D9 0%, #FFD4C4 100%)', padding: '6px 20px', borderRadius: '12px', color: '#FF7B54', fontWeight: 600, borderBottom: '3px solid #FF7B54' }}>_____</span> like me!
          </div>
        </div>
        
        <p style={{ textAlign: 'center', color: '#9CA3AF', marginBottom: '20px', fontWeight: 500 }}>Tap a word to fill in the blank:</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {["grace", "wretch", "soul", "heart", "life", "world"].map((word) => (
            <button key={word} style={{ 
              background: 'white', 
              border: '3px solid #E8E0D5', 
              padding: '14px 28px', 
              borderRadius: '14px', 
              fontSize: '17px', 
              fontWeight: 700, 
              cursor: 'pointer',
              color: '#2D3748',
              transition: 'all 0.2s'
            }}>{word}</button>
          ))}
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button style={{ padding: '12px 24px', borderRadius: '12px', border: '2px solid #E8E0D5', background: 'white', color: '#9CA3AF', fontWeight: 600, cursor: 'pointer' }}>💡 Hint</button>
          <button style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#FF7B54', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Skip →</button>
        </div>
      </main>
    </div>
  )
}

// ================== FLASHCARDS PAGE ==================
function FlashcardsPage() {
  const [flipped, setFlipped] = useState(false)
  
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '3px solid rgba(155, 89, 182, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#9B59B6', fontWeight: 600 }}>← Exit</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#9B59B6', margin: 0 }}>Flashcards</h1>
        <div style={{ background: 'rgba(155, 89, 182, 0.1)', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, color: '#9B59B6', fontSize: '14px' }}>3 / 10</div>
      </header>
      
      <main style={{ padding: '40px 24px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ flex: 1, background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#6BCB77' }}>3</div>
            <div style={{ fontSize: '14px', color: '#4CAF50', fontWeight: 600 }}>Know It</div>
          </div>
          <div style={{ flex: 1, background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#FF7B54' }}>7</div>
            <div style={{ fontSize: '14px', color: '#F57C00', fontWeight: 600 }}>Learning</div>
          </div>
        </div>
        
        <div onClick={() => setFlipped(!flipped)} style={{ 
          background: flipped ? 'linear-gradient(135deg, #9B59B6, #8E44AD)' : 'white', 
          borderRadius: '28px', 
          padding: '60px 32px', 
          boxShadow: '0 12px 40px rgba(155, 89, 182, 0.2)', 
          textAlign: 'center', 
          marginBottom: '32px', 
          border: flipped ? 'none' : '4px solid #9B59B6',
          cursor: 'pointer',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s'
        }}>
          <div style={{ fontSize: '13px', color: flipped ? 'rgba(255,255,255,0.8)' : '#9B59B6', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {flipped ? 'Answer' : 'Lyric'}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: flipped ? 'white' : '#2D3748', fontStyle: flipped ? 'normal' : 'italic', lineHeight: 1.5 }}>
            {flipped ? 'Amazing Grace' : '"Amazing grace! How sweet the sound, that saved a wretch like me..."'}
          </div>
          {!flipped && <div style={{ marginTop: '24px', fontSize: '14px', color: '#9CA3AF' }}>Tap to reveal answer</div>}
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ flex: 1, padding: '18px', borderRadius: '16px', border: '3px solid #FF7B54', background: 'white', color: '#FF7B54', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Still Learning</button>
          <button style={{ flex: 1, padding: '18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #6BCB77, #4CAF50)', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Know It!</button>
        </div>
      </main>
    </div>
  )
}

// ================== BINGO PAGE ==================
function BingoPage() {
  const [markedCells, setMarkedCells] = useState(new Set())
  const bingoItems = [
    "Grace", "Love", "Faith", "Hope", "Peace",
    "Joy", "Light", "Truth", "FREE", "Glory",
    "Holy", "Praise", "Lord", "King", "Mercy",
    "Lamb", "Cross", "Heaven", "Soul", "Heart",
    "Saved", "Sing", "Rise", "Reign", "Come"
  ]

  const toggleCell = (index) => {
    const newMarked = new Set(markedCells)
    if (newMarked.has(index)) {
      newMarked.delete(index)
    } else {
      newMarked.add(index)
    }
    setMarkedCells(newMarked)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FCE4EC 0%, #FFF9F0 100%)' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '3px solid #F8BBD9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#E91E63', fontWeight: 600 }}>← Exit</Link>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#E91E63', margin: 0, letterSpacing: '2px' }}>HYMN BINGO</h1>
        <button style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#E91E63', color: 'white', fontWeight: 600, cursor: 'pointer' }}>New Card</button>
      </header>
      
      <main style={{ padding: '32px 16px', maxWidth: '450px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '16px', boxShadow: '0 8px 32px rgba(233, 30, 99, 0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {bingoItems.map((item, index) => (
              <button 
                key={index} 
                onClick={() => toggleCell(index)}
                style={{ 
                  aspectRatio: '1', 
                  borderRadius: '12px', 
                  border: 'none',
                  background: item === 'FREE' 
                    ? 'linear-gradient(135deg, #FFD93D, #F57C00)' 
                    : markedCells.has(index) 
                      ? 'linear-gradient(135deg, #E91E63, #C2185B)' 
                      : '#F7F4EF',
                  color: (item === 'FREE' || markedCells.has(index)) ? 'white' : '#2D3748',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', marginBottom: '16px' }}>Listen for lyrics and mark matching words!</p>
          <button style={{ padding: '14px 32px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #E91E63, #C2185B)', color: 'white', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.3)' }}>
            🎉 BINGO!
          </button>
        </div>
      </main>
    </div>
  )
}

// ================== VERSE ORDER PAGE ==================
function VerseOrderPage() {
  const verses = [
    "I once was lost, but now am found",
    "Amazing grace! How sweet the sound",
    "Was blind, but now I see",
    "That saved a wretch like me!"
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '3px solid #FFF3CD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#F57C00', fontWeight: 600 }}>← Exit</Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#F57C00', margin: 0 }}>Verse Order</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0 0' }}>Amazing Grace - Verse 1</p>
        </div>
        <div style={{ background: '#FFF3CD', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, color: '#F57C00', fontSize: '14px' }}>1 / 3</div>
      </header>
      
      <main style={{ padding: '40px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '32px', fontSize: '16px' }}>Drag the lines into the correct order:</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {verses.map((verse, index) => (
            <div key={index} style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '20px 24px', 
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '2px solid #E8E0D5',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'grab'
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: '#FFD93D', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                color: '#F57C00',
                fontSize: '14px'
              }}>☰</div>
              <span style={{ fontSize: '17px', color: '#2D3748', fontStyle: 'italic' }}>"{verse}"</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button style={{ padding: '14px 28px', borderRadius: '14px', border: '2px solid #E8E0D5', background: 'white', color: '#9CA3AF', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
          <button style={{ padding: '14px 28px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #FFD93D, #F57C00)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Check Order</button>
        </div>
      </main>
    </div>
  )
}

// ================== LYRIC MATCH PAGE ==================
function LyricMatchPage() {
  const [selectedLeft, setSelectedLeft] = useState(null)
  const leftLines = [
    "Amazing grace! How sweet",
    "I once was lost",
    "Was blind, but now",
    "That saved a wretch"
  ]
  const rightLines = [
    "but now am found",
    "like me!",
    "I see",
    "the sound"
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '3px solid rgba(107, 203, 119, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#6BCB77', fontWeight: 600 }}>← Exit</Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#6BCB77', margin: 0 }}>Lyric Match</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0 0' }}>Amazing Grace</p>
        </div>
        <div style={{ background: 'rgba(107, 203, 119, 0.15)', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, color: '#6BCB77', fontSize: '14px' }}>2 / 4</div>
      </header>
      
      <main style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '32px', fontSize: '16px' }}>Match the beginning of each line to its ending:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leftLines.map((line, index) => (
              <button key={index} onClick={() => setSelectedLeft(index)} style={{ 
                background: selectedLeft === index ? '#6BCB77' : 'white', 
                color: selectedLeft === index ? 'white' : '#2D3748',
                borderRadius: '14px', 
                padding: '18px 20px', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: selectedLeft === index ? '2px solid #4CAF50' : '2px solid #E8E0D5',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}>
                {line}...
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '24px', color: '#6BCB77' }}>🔗</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rightLines.map((line, index) => (
              <button key={index} style={{ 
                background: 'white', 
                borderRadius: '14px', 
                padding: '18px 20px', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '2px solid #E8E0D5',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 500,
                color: '#2D3748',
                transition: 'all 0.2s'
              }}>
                ...{line}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, rgba(107, 203, 119, 0.1), rgba(76, 175, 80, 0.1))', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#6BCB77', fontWeight: 600, margin: 0 }}>Matched: 2 of 4 pairs</p>
        </div>
      </main>
    </div>
  )
}

// ================== ROUTER ==================
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
        <Route path="/games/bingo/play" element={<BingoPage />} />
        <Route path="/games/verse-order/play" element={<VerseOrderPage />} />
        <Route path="/games/lyric-match/play" element={<LyricMatchPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
