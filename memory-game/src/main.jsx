import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'

// ================== HOME PAGE ==================
const gameTypes = [
  { id: "jeopardy", name: "Jeopardy", description: "Quiz-style game with categories and points", color: "#4A90D9", emoji: "📋", games: 3 },
  { id: "fill-in-blank", name: "Fill in the Blank", description: "Complete the missing lyrics", color: "#FF7B54", emoji: "✏️", games: 5 },
  { id: "verse-order", name: "Verse Order", description: "Put verses in the correct sequence", color: "#FFD93D", emoji: "📜", games: 2 },
  { id: "lyric-match", name: "Lyric Match", description: "Match line beginnings to endings", color: "#6BCB77", emoji: "🔗", games: 4 },
  { id: "flashcards", name: "Flashcards", description: "Study cards for memorization", color: "#9B59B6", emoji: "📇", games: 6 },
  { id: "bingo", name: "Song Bingo", description: "Fun group activity with lyrics", color: "#4A90D9", emoji: "🎯", games: 2 },
]

function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', borderBottom: '4px solid rgba(74, 144, 217, 0.2)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: '#4A90D9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>♪</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', margin: 0 }}>HymnPlay</h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Learn songs through games</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '8px' }}>
          <Link to="/songs" style={{ padding: '8px 16px', borderRadius: '12px', color: '#2D3748', textDecoration: 'none', fontWeight: 500 }}>Songs</Link>
          <Link to="/games/create" style={{ padding: '8px 16px', borderRadius: '12px', color: '#2D3748', textDecoration: 'none', fontWeight: 500 }}>Create Game</Link>
        </nav>
      </header>

      <section style={{ background: 'linear-gradient(to bottom, rgba(74, 144, 217, 0.1), #FFF9F0)', padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 500, color: '#4A90D9', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>✨ Making hymn learning fun!</div>
          <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#2D3748', marginBottom: '16px', lineHeight: 1.2 }}>Learn Your Favorite Songs<br />Through Play</h2>
          <p style={{ fontSize: '18px', color: '#6B7280', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.6 }}>Create custom games from any hymn or song. Perfect for Sunday school, family devotions, or personal study.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/games/create" style={{ background: '#4A90D9', color: 'white', padding: '12px 24px', borderRadius: '16px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>🎮 Create a Game</Link>
            <Link to="/songs" style={{ background: 'white', color: '#2D3748', padding: '12px 24px', borderRadius: '16px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>🎵 Add Songs</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 16px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#2D3748', marginBottom: '32px' }}>Choose a Game Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {gameTypes.map((game) => (
              <Link key={game.id} to={`/games/${game.id}/play`} style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textDecoration: 'none', border: '2px solid transparent' }}>
                <div style={{ width: '56px', height: '56px', background: game.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>{game.emoji}</div>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#2D3748', marginBottom: '8px' }}>{game.name}</h4>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>{game.description}</p>
                <span style={{ fontSize: '12px', background: '#F0EDE8', padding: '4px 12px', borderRadius: '9999px', fontWeight: 500, color: '#6B7280' }}>{game.games} games</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 16px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #4A90D9, #FF7B54)', borderRadius: '24px', padding: '32px', color: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
              <div><div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>12</div><div style={{ opacity: 0.8, fontSize: '14px' }}>Songs Added</div></div>
              <div><div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>22</div><div style={{ opacity: 0.8, fontSize: '14px' }}>Games Created</div></div>
              <div><div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>48</div><div style={{ opacity: 0.8, fontSize: '14px' }}>Games Played</div></div>
              <div><div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>6</div><div style={{ opacity: 0.8, fontSize: '14px' }}>Game Types</div></div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '32px 16px', borderTop: '1px solid #E5E1DC', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
        <p style={{margin: 0}}>HymnPlay - Making hymn learning fun for kids and families</p>
      </footer>
    </div>
  )
}

// ================== JEOPARDY PLAY PAGE ==================
function JeopardyPlayPage() {
  const categories = ["Amazing Grace", "Holy Holy Holy", "Great Is Thy", "Be Thou My Vision"]
  const points = [100, 200, 300, 400, 500]
  
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a6e', color: 'white' }}>
      <header style={{ background: '#0d0d4a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>← Back</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FFD93D', margin: 0 }}>Hymn Jeopardy</h1>
        <div></div>
      </header>
      
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ background: '#4A90D9', padding: '8px 24px', borderRadius: '12px' }}><span style={{ fontSize: '14px', opacity: 0.8 }}>Team 1:</span> <span style={{ fontWeight: 700, fontSize: '20px' }}>1200</span></div>
          <div style={{ background: '#FF7B54', padding: '8px 24px', borderRadius: '12px' }}><span style={{ fontSize: '14px', opacity: 0.8 }}>Team 2:</span> <span style={{ fontWeight: 700, fontSize: '20px' }}>800</span></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {categories.map((cat, i) => (
            <div key={i} style={{ background: '#0d0d4a', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>{cat}</div>
          ))}
          {points.map((p) => categories.map((_, i) => (
            <button key={`${p}-${i}`} style={{ background: '#1a1a8e', border: 'none', padding: '24px', borderRadius: '8px', color: '#FFD93D', fontWeight: 700, fontSize: '24px', cursor: 'pointer' }}>${p}</button>
          )))}
        </div>
      </div>
    </div>
  )
}

// ================== FILL IN BLANK PAGE ==================
function FillInBlankPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E8E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>← Back</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FF7B54', margin: 0 }}>Fill in the Blank</h1>
        <div></div>
      </header>
      
      <main style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: '#FF7B54', fontWeight: 600, marginBottom: '8px' }}>Amazing Grace - Verse 1</div>
          <div style={{ fontSize: '24px', lineHeight: 1.8, color: '#2D3748' }}>
            Amazing <span style={{ background: '#FFE4D9', padding: '4px 12px', borderRadius: '8px', color: '#FF7B54' }}>_____</span>! How sweet the sound<br />
            That saved a <span style={{ background: '#FFE4D9', padding: '4px 12px', borderRadius: '8px', color: '#FF7B54' }}>_____</span> like me!
          </div>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {["grace", "wretch", "soul", "life"].map((word) => (
            <button key={word} style={{ background: 'white', border: '2px solid #E8E0D5', padding: '12px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>{word}</button>
          ))}
        </div>
      </main>
    </div>
  )
}

// ================== FLASHCARDS PAGE ==================
function FlashcardsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E8E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#1a1a1a' }}>← Back</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#4A90D9', margin: 0 }}>Flashcards</h1>
        <div></div>
      </header>
      
      <main style={{ padding: '32px 24px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ flex: 1, background: '#E8F5E9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#6BCB77' }}>3</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Know It</div>
          </div>
          <div style={{ flex: 1, background: '#FFF3E0', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#FF7B54' }}>2</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Learning</div>
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '24px', padding: '48px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '24px', border: '3px solid #4A90D9' }}>
          <div style={{ fontSize: '12px', color: '#4A90D9', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase' }}>Lyric</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a', fontStyle: 'italic' }}>"Amazing grace! How sweet the sound..."</div>
          <div style={{ marginTop: '24px', fontSize: '14px', color: '#999' }}>Tap to reveal answer</div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '3px solid #FF7B54', background: 'white', color: '#FF7B54', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Still Learning</button>
          <button style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: '#6BCB77', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Know It!</button>
        </div>
      </main>
    </div>
  )
}

// ================== PLACEHOLDER PAGES ==================
function SongsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0', padding: '24px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#4A90D9' }}>← Back to Home</Link>
      <h1 style={{ color: '#2D3748' }}>Song Library</h1>
      <p style={{ color: '#6B7280' }}>Your songs will appear here</p>
    </div>
  )
}

function CreateGamePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0', padding: '24px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#4A90D9' }}>← Back to Home</Link>
      <h1 style={{ color: '#2D3748' }}>Create a Game</h1>
      <p style={{ color: '#6B7280' }}>Game creation wizard coming soon</p>
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
        <Route path="/games/create" element={<CreateGamePage />} />
        <Route path="/games/jeopardy/play" element={<JeopardyPlayPage />} />
        <Route path="/games/fill-in-blank/play" element={<FillInBlankPage />} />
        <Route path="/games/flashcards/play" element={<FlashcardsPage />} />
        <Route path="/games/:type/play" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
