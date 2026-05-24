import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getGame, getGridLayout } from '../utils/storage'
import './GamePlay.css'

function GamePlay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    const loadedGame = getGame(id)
    if (!loadedGame) {
      navigate('/library')
      return
    }
    setGame(loadedGame)
    initializeCards(loadedGame)
  }, [id, navigate])

  useEffect(() => {
    let interval
    if (isRunning && !gameWon) {
      interval = setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, gameWon])

  const initializeCards = (gameData) => {
    // Support both old 'images' format and new 'pairs' format
    const pairs = gameData.pairs || gameData.images?.map(img => ({ ...img, type: 'image' })) || []
    const cardPairs = pairs.flatMap((pair, idx) => [
      { id: `${pair.id}-a`, pairId: idx, type: pair.type || 'image', url: pair.url, text: pair.text, position: pair.position },
      { id: `${pair.id}-b`, pairId: idx, type: pair.type || 'image', url: pair.url, text: pair.text, position: pair.position }
    ])
    
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]]
    }
    
    setCards(cardPairs)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTime(0)
    setIsRunning(false)
    setGameWon(false)
  }

  const handleCardClick = useCallback((cardId) => {
    if (!isRunning) setIsRunning(true)
    if (flipped.length === 2) return
    if (flipped.includes(cardId)) return
    if (matched.includes(cardId)) return

    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped
      const firstCard = cards.find(c => c.id === first)
      const secondCard = cards.find(c => c.id === second)

      if (firstCard.pairId === secondCard.pairId) {
        const newMatched = [...matched, first, second]
        setMatched(newMatched)
        setFlipped([])
        
        if (newMatched.length === cards.length) {
          setGameWon(true)
          setIsRunning(false)
        }
      } else {
        setTimeout(() => setFlipped([]), 1200)
      }
    }
  }, [flipped, matched, cards, isRunning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!game) return null

  const layout = getGridLayout(game.pairCount)

  return (
    <div className="gameplay container">
      <Link to="/library" className="back-link">← Back to Library</Link>
      
      <div className="game-header">
        <button className="btn btn-secondary reset-btn" onClick={() => initializeCards(game)}>
          Reset
        </button>
        <h1 className="game-title">{game.name}</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(time)}</span>
          </div>
        </div>
      </div>

      <div
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
          '--theme-color': game.themeColor || '#667eea',
          '--card-aspect': game.aspectRatio || 1
        }}
      >
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id)
          const isMatched = matched.includes(card.id)
          
          return (
            <div
              key={card.id}
              className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="card-inner">
                <div className="card-front">
                  {card.type === 'text' ? (
                    <div className="card-text">{card.text}</div>
                  ) : (
                    <img
                      src={card.url}
                      alt="Card"
                      style={card.position ? { objectPosition: `${card.position.x}% ${card.position.y}%` } : undefined}
                    />
                  )}
                </div>
                <div className="card-back" style={{ background: game.themeColor || '#667eea' }}>
                  <span className="card-number">{index + 1}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {gameWon && (
        <div className="win-modal">
          <div className="win-content">
            <div className="win-icon">🎉</div>
            <h2>Congratulations!</h2>
            <p>You completed "{game.name}"</p>
            <div className="win-stats">
              <div className="win-stat">
                <span className="win-stat-value">{moves}</span>
                <span className="win-stat-label">Moves</span>
              </div>
              <div className="win-stat">
                <span className="win-stat-value">{formatTime(time)}</span>
                <span className="win-stat-label">Time</span>
              </div>
            </div>
            <div className="win-actions">
              <button className="btn btn-primary" onClick={() => initializeCards(game)}>
                Play Again
              </button>
              <Link to="/library" className="btn btn-secondary">
                Back to Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamePlay
