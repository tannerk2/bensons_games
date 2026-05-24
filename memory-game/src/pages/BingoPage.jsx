import { useState } from 'react';
import { Link } from 'react-router-dom';

const mockBingoCard = [
  "Amazing Grace", "Holy Holy Holy", "How Great Thou Art", "Be Thou My Vision", "FREE",
  "Rock of Ages", "Great Is Thy Faithfulness", "It Is Well", "Blessed Assurance", "A Mighty Fortress",
  "Come Thou Fount", "What a Friend", "Joyful Joyful", "Fairest Lord Jesus", "All Creatures",
  "O Sacred Head", "When I Survey", "Crown Him", "The Old Rugged Cross", "In the Garden",
  "Nearer My God", "Abide With Me", "Just As I Am", "Lead Kindly Light", "O God Our Help"
];

export default function BingoPage() {
  const [selected, setSelected] = useState([12]); // FREE space pre-selected
  const [currentClue, setCurrentClue] = useState("'What a friend we have in Jesus, all our sins and griefs to bear...'");

  const toggleCell = (index) => {
    if (index === 12) return; // FREE space
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  const checkBingo = () => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      const row = [0, 1, 2, 3, 4].map(j => i * 5 + j);
      if (row.every(idx => selected.includes(idx))) return true;
    }
    // Check columns
    for (let i = 0; i < 5; i++) {
      const col = [0, 1, 2, 3, 4].map(j => j * 5 + i);
      if (col.every(idx => selected.includes(idx))) return true;
    }
    // Check diagonals
    const diag1 = [0, 6, 12, 18, 24];
    const diag2 = [4, 8, 12, 16, 20];
    if (diag1.every(idx => selected.includes(idx))) return true;
    if (diag2.every(idx => selected.includes(idx))) return true;
    return false;
  };

  const hasBingo = checkBingo();

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        padding: '16px 24px',
        borderBottom: '1px solid #E8E0D5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          textDecoration: 'none',
          color: '#1a1a1a'
        }}>
          <span style={{ fontSize: '24px' }}>&#9664;</span>
          <span style={{ fontWeight: '600' }}>Back</span>
        </Link>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: '700',
          color: '#9C27B0'
        }}>
          Song Bingo
        </h1>
        <div style={{ width: '80px' }}></div>
      </header>

      <main style={{ padding: '24px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Current Clue */}
        <div style={{
          background: 'linear-gradient(135deg, #9C27B0, #E91E63)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '12px', 
            textTransform: 'uppercase',
            letterSpacing: '2px',
            opacity: 0.8,
            marginBottom: '12px'
          }}>
            Current Clue
          </div>
          <div style={{ 
            fontSize: '18px',
            fontStyle: 'italic',
            lineHeight: 1.5
          }}>
            {currentClue}
          </div>
        </div>

        {/* Bingo Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {/* BINGO Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {['B', 'I', 'N', 'G', 'O'].map((letter, i) => (
              <div key={letter} style={{
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: '800',
                color: ['#FF7B54', '#FFD93D', '#6BCB77', '#4A90D9', '#9C27B0'][i]
              }}>
                {letter}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px'
          }}>
            {mockBingoCard.map((song, index) => {
              const isSelected = selected.includes(index);
              const isFree = index === 12;
              
              return (
                <button
                  key={index}
                  onClick={() => toggleCell(index)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    border: isSelected ? 'none' : '2px solid #E8E0D5',
                    background: isFree 
                      ? 'linear-gradient(135deg, #FFD93D, #FF7B54)'
                      : isSelected 
                        ? '#6BCB77'
                        : 'white',
                    color: isSelected || isFree ? 'white' : '#1a1a1a',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '4px',
                    cursor: isFree ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isFree ? (
                    <span style={{ fontSize: '14px' }}>FREE</span>
                  ) : (
                    song
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bingo Alert */}
        {hasBingo && (
          <div style={{
            marginTop: '24px',
            background: 'linear-gradient(135deg, #FFD93D, #FF7B54)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            animation: 'pulse 1s infinite'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>&#127881;</div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: '800',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              BINGO!
            </div>
          </div>
        )}

        {/* New Card Button */}
        <button style={{
          width: '100%',
          marginTop: '24px',
          padding: '16px',
          borderRadius: '16px',
          border: '3px solid #9C27B0',
          background: 'white',
          color: '#9C27B0',
          fontSize: '16px',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          New Card
        </button>
      </main>
    </div>
  );
}
