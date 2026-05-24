import { useState } from 'react';
import { Link } from 'react-router-dom';

const mockPairs = [
  { id: 1, left: "Amazing grace! How sweet", right: "the sound" },
  { id: 2, left: "That saved a wretch", right: "like me!" },
  { id: 3, left: "I once was lost,", right: "but now am found" },
  { id: 4, left: "Was blind,", right: "but now I see" },
  { id: 5, left: "Through many dangers,", right: "toils and snares" },
];

export default function LyricMatchPage() {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);

  // Shuffle right side
  const [shuffledRight] = useState(() => 
    [...mockPairs].sort(() => Math.random() - 0.5)
  );

  const handleLeftClick = (id) => {
    if (matched.includes(id)) return;
    setSelectedLeft(id);
    setWrongPair(null);
    
    if (selectedRight !== null) {
      // Check match
      if (selectedRight === id) {
        setMatched([...matched, id]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setWrongPair({ left: id, right: selectedRight });
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongPair(null);
        }, 800);
      }
    }
  };

  const handleRightClick = (id) => {
    if (matched.includes(id)) return;
    setSelectedRight(id);
    setWrongPair(null);
    
    if (selectedLeft !== null) {
      // Check match
      if (selectedLeft === id) {
        setMatched([...matched, id]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setWrongPair({ left: selectedLeft, right: id });
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongPair(null);
        }, 800);
      }
    }
  };

  const progress = (matched.length / mockPairs.length) * 100;
  const isComplete = matched.length === mockPairs.length;

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
          color: '#E91E63'
        }}>
          Lyric Match
        </h1>
        <div style={{ width: '80px' }}></div>
      </header>

      <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span>Amazing Grace - Verse 1</span>
            <span>{matched.length} / {mockPairs.length} matched</span>
          </div>
          <div style={{ 
            height: '8px', 
            background: '#E8E0D5',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #E91E63, #9C27B0)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#FCE4EC',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>&#128161;</span>
          <span style={{ fontSize: '14px', color: '#C2185B' }}>
            Match the beginning of each line with its ending!
          </span>
        </div>

        {/* Matching Area */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              Beginning
            </div>
            {mockPairs.map((pair) => {
              const isMatched = matched.includes(pair.id);
              const isSelected = selectedLeft === pair.id;
              const isWrong = wrongPair?.left === pair.id;
              
              return (
                <button
                  key={pair.id}
                  onClick={() => handleLeftClick(pair.id)}
                  disabled={isMatched}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: isSelected ? '3px solid #E91E63' : '2px solid #E8E0D5',
                    background: isMatched 
                      ? '#E8F5E9' 
                      : isWrong 
                        ? '#FFEBEE'
                        : isSelected 
                          ? '#FCE4EC' 
                          : 'white',
                    color: isMatched ? '#6BCB77' : '#1a1a1a',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: isMatched ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    opacity: isMatched ? 0.7 : 1
                  }}
                >
                  {pair.left}
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              Ending
            </div>
            {shuffledRight.map((pair) => {
              const isMatched = matched.includes(pair.id);
              const isSelected = selectedRight === pair.id;
              const isWrong = wrongPair?.right === pair.id;
              
              return (
                <button
                  key={pair.id}
                  onClick={() => handleRightClick(pair.id)}
                  disabled={isMatched}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: isSelected ? '3px solid #9C27B0' : '2px solid #E8E0D5',
                    background: isMatched 
                      ? '#E8F5E9' 
                      : isWrong 
                        ? '#FFEBEE'
                        : isSelected 
                          ? '#F3E5F5' 
                          : 'white',
                    color: isMatched ? '#6BCB77' : '#1a1a1a',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: isMatched ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    opacity: isMatched ? 0.7 : 1
                  }}
                >
                  {pair.right}
                </button>
              );
            })}
          </div>
        </div>

        {/* Complete State */}
        {isComplete && (
          <div style={{
            marginTop: '32px',
            background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#127881;</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Perfect Match!
            </div>
            <div style={{ opacity: 0.9, marginBottom: '20px' }}>
              You matched all the lyrics correctly!
            </div>
            <button style={{
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              background: 'white',
              color: '#E91E63',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
