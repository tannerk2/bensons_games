import { useState } from 'react';
import { Link } from 'react-router-dom';

const mockVerses = [
  { id: 1, text: "Amazing grace! How sweet the sound", order: 1 },
  { id: 2, text: "That saved a wretch like me!", order: 2 },
  { id: 3, text: "I once was lost, but now am found;", order: 3 },
  { id: 4, text: "Was blind, but now I see.", order: 4 },
];

export default function VerseOrderPage() {
  const [items, setItems] = useState(() => 
    [...mockVerses].sort(() => Math.random() - 0.5)
  );
  const [draggedId, setDraggedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleDragStart = (id) => {
    setDraggedId(id);
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (draggedId === targetId) return;
    
    const draggedIndex = items.findIndex(item => item.id === draggedId);
    const targetIndex = items.findIndex(item => item.id === targetId);
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    setItems(newItems);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const checkOrder = () => {
    const correct = items.every((item, index) => item.order === index + 1);
    setIsCorrect(correct);
  };

  const isOrderCorrect = items.every((item, index) => item.order === index + 1);

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
          color: '#FF7B54'
        }}>
          Verse Order
        </h1>
        <div style={{ width: '80px' }}></div>
      </header>

      <main style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Song Title */}
        <div style={{
          background: 'linear-gradient(135deg, #FF7B54, #FFD93D)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ 
            fontSize: '12px', 
            textTransform: 'uppercase',
            letterSpacing: '2px',
            opacity: 0.8,
            marginBottom: '8px'
          }}>
            Put these lines in order
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>
            Amazing Grace (Verse 1)
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: '#E3F2FD',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>&#128161;</span>
          <span style={{ fontSize: '14px', color: '#1976D2' }}>
            Drag and drop the lines to arrange them in the correct order
          </span>
        </div>

        {/* Draggable Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              style={{
                background: draggedId === item.id ? '#E8E0D5' : 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '2px solid transparent',
                transition: 'all 0.2s ease',
                opacity: draggedId === item.id ? 0.5 : 1
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#F5F0E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: '#999',
                fontSize: '14px'
              }}>
                {index + 1}
              </div>
              <div style={{
                flex: 1,
                fontSize: '16px',
                fontWeight: '500',
                color: '#1a1a1a'
              }}>
                {item.text}
              </div>
              <div style={{ color: '#ccc', fontSize: '20px' }}>&#9776;</div>
            </div>
          ))}
        </div>

        {/* Check Button */}
        <button
          onClick={checkOrder}
          style={{
            width: '100%',
            padding: '20px',
            borderRadius: '16px',
            border: 'none',
            background: isOrderCorrect 
              ? 'linear-gradient(135deg, #6BCB77, #4A90D9)' 
              : '#4A90D9',
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
          {isOrderCorrect ? (
            <>
              <span style={{ fontSize: '24px' }}>&#10004;</span>
              Perfect! Well Done!
            </>
          ) : (
            'Check My Answer'
          )}
        </button>

        {/* Success State */}
        {isCorrect && isOrderCorrect && (
          <div style={{
            marginTop: '24px',
            background: '#E8F5E9',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#127881;</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#6BCB77' }}>
              You got it right!
            </div>
            <button style={{
              marginTop: '16px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#6BCB77',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Next Verse
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
