import { useState } from 'react';
import { Link } from 'react-router-dom';

const mockCards = [
  { id: 1, front: "Amazing Grace, how sweet the sound...", back: "Amazing Grace", song: "Amazing Grace" },
  { id: 2, front: "Holy, Holy, Holy, Lord God Almighty...", back: "Holy, Holy, Holy", song: "Holy, Holy, Holy" },
  { id: 3, front: "What a friend we have in Jesus...", back: "What a Friend We Have in Jesus", song: "What a Friend" },
  { id: 4, front: "Rock of Ages, cleft for me...", back: "Rock of Ages", song: "Rock of Ages" },
  { id: 5, front: "Blessed assurance, Jesus is mine...", back: "Blessed Assurance", song: "Blessed Assurance" },
];

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [learning, setLearning] = useState([]);

  const currentCard = mockCards[currentIndex];
  const progress = ((known.length + learning.length) / mockCards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleKnow = () => {
    setKnown([...known, currentCard.id]);
    nextCard();
  };

  const handleLearning = () => {
    setLearning([...learning, currentCard.id]);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < mockCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

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
          color: '#4A90D9'
        }}>
          Flashcards
        </h1>
        <div style={{ width: '80px' }}></div>
      </header>

      <main style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span>Card {currentIndex + 1} of {mockCards.length}</span>
            <span>{Math.round(progress)}% complete</span>
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
              background: 'linear-gradient(90deg, #6BCB77, #4A90D9)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            flex: 1,
            background: '#E8F5E9',
            padding: '16px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#6BCB77' }}>
              {known.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Know It</div>
          </div>
          <div style={{ 
            flex: 1,
            background: '#FFF3E0',
            padding: '16px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#FF7B54' }}>
              {learning.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Learning</div>
          </div>
        </div>

        {/* Flashcard */}
        <div 
          onClick={handleFlip}
          style={{ 
            perspective: '1000px',
            marginBottom: '32px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}>
            {/* Front */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              border: '3px solid #4A90D9'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#4A90D9',
                fontWeight: '600',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Lyric
              </div>
              <div style={{ 
                fontSize: '22px',
                fontWeight: '600',
                textAlign: 'center',
                color: '#1a1a1a',
                lineHeight: '1.5',
                fontStyle: 'italic'
              }}>
                "{currentCard.front}"
              </div>
              <div style={{ 
                marginTop: '24px',
                fontSize: '14px',
                color: '#999'
              }}>
                Tap to reveal answer
              </div>
            </div>

            {/* Back */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #4A90D9, #6BCB77)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              transform: 'rotateY(180deg)'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: 'rgba(255,255,255,0.8)',
                fontWeight: '600',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Song Title
              </div>
              <div style={{ 
                fontSize: '28px',
                fontWeight: '700',
                textAlign: 'center',
                color: 'white'
              }}>
                {currentCard.back}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={handleLearning}
            style={{
              flex: 1,
              padding: '20px',
              borderRadius: '16px',
              border: '3px solid #FF7B54',
              background: 'white',
              color: '#FF7B54',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '24px' }}>&#128260;</span>
            Still Learning
          </button>
          <button
            onClick={handleKnow}
            style={{
              flex: 1,
              padding: '20px',
              borderRadius: '16px',
              border: 'none',
              background: '#6BCB77',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '24px' }}>&#10004;</span>
            Know It!
          </button>
        </div>
      </main>
    </div>
  );
}
