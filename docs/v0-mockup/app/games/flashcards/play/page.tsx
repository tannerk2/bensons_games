"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Music, 
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Shuffle,
  Check,
  X,
  RefreshCw
} from "lucide-react"

const flashcards = [
  {
    id: 1,
    front: "Amazing grace, how sweet the sound",
    back: "Amazing Grace",
    song: "Amazing Grace"
  },
  {
    id: 2,
    front: "That saved a wretch like me",
    back: "Amazing Grace",
    song: "Amazing Grace"
  },
  {
    id: 3,
    front: "Then sings my soul, my Savior God to Thee",
    back: "How Great Thou Art",
    song: "How Great Thou Art"
  },
  {
    id: 4,
    front: "When peace like a river attendeth my way",
    back: "It Is Well With My Soul",
    song: "It Is Well"
  },
  {
    id: 5,
    front: "Great is Thy faithfulness, O God my Father",
    back: "Great Is Thy Faithfulness",
    song: "Great Is Thy Faithfulness"
  },
]

export default function FlashcardsGamePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set())
  const [learningCards, setLearningCards] = useState<Set<number>>(new Set())

  const currentCard = flashcards[currentIndex]
  const progress = ((currentIndex + 1) / flashcards.length) * 100

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleKnow = () => {
    setKnownCards(prev => new Set([...prev, currentIndex]))
    handleNext()
  }

  const handleLearning = () => {
    setLearningCards(prev => new Set([...prev, currentIndex]))
    handleNext()
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    // In real app, would shuffle the cards
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownCards(new Set())
    setLearningCards(new Set())
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b-4 border-primary/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">HymnPlay</h1>
              <p className="text-sm text-muted-foreground">Flashcards</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShuffle}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              Shuffle
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
            <Link 
              href="/"
              className="px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Exit
            </Link>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-game-green">
                <Check className="w-4 h-4" /> Know: {knownCards.size}
              </span>
              <span className="flex items-center gap-1 text-game-coral">
                <RefreshCw className="w-4 h-4" /> Learning: {learningCards.size}
              </span>
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-game-purple to-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Card */}
        <div className="perspective-1000 mb-8">
          <button
            onClick={handleFlip}
            className="w-full aspect-[4/3] relative cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of Card */}
              <div 
                className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Lyric
                </span>
                <p className="text-2xl md:text-3xl font-medium text-foreground text-center leading-relaxed text-balance">
                  {currentCard.front}
                </p>
                <p className="text-sm text-muted-foreground mt-6">
                  Tap to flip
                </p>
              </div>

              {/* Back of Card */}
              <div 
                className="absolute inset-0 w-full h-full bg-game-purple rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center [transform:rotateY(180deg)]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-sm text-white/70 mb-4">Song Title</span>
                <p className="text-3xl md:text-4xl font-bold text-white text-center">
                  {currentCard.back}
                </p>
                <p className="text-sm text-white/70 mt-6">
                  Tap to flip back
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handleLearning}
            className="flex-1 max-w-[200px] bg-game-coral/10 hover:bg-game-coral/20 text-game-coral px-6 py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Still Learning
          </button>
          <button
            onClick={handleKnow}
            className="flex-1 max-w-[200px] bg-game-green/10 hover:bg-game-green/20 text-game-green px-6 py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Know It!
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-4 rounded-2xl bg-white shadow-soft hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            {flashcards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i)
                  setIsFlipped(false)
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentIndex 
                    ? "bg-primary w-8" 
                    : knownCards.has(i)
                      ? "bg-game-green"
                      : learningCards.has(i)
                        ? "bg-game-coral"
                        : "bg-muted hover:bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="p-4 rounded-2xl bg-white shadow-soft hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Completion Message */}
        {currentIndex === flashcards.length - 1 && (knownCards.size + learningCards.size === flashcards.length) && (
          <div className="mt-8 bg-game-yellow/20 rounded-3xl p-6 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Great job!</h3>
            <p className="text-muted-foreground mb-4">
              You&apos;ve gone through all the cards. Keep practicing the ones you&apos;re still learning!
            </p>
            <button
              onClick={handleReset}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
