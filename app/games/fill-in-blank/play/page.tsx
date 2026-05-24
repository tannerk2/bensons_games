"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Music, 
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Home,
  Sparkles,
  Heart
} from "lucide-react"

const questions = [
  {
    id: 1,
    song: "Amazing Grace",
    line: "Amazing grace, how sweet the ____",
    answer: "sound",
    hint: "s____"
  },
  {
    id: 2,
    song: "Amazing Grace",
    line: "That saved a ____ like me",
    answer: "wretch",
    hint: "w_____"
  },
  {
    id: 3,
    song: "Amazing Grace",
    line: "I once was ____ but now am found",
    answer: "lost",
    hint: "l___"
  },
  {
    id: 4,
    song: "How Great Thou Art",
    line: "Then sings my ____, my Savior God to Thee",
    answer: "soul",
    hint: "s___"
  },
  {
    id: 5,
    song: "How Great Thou Art",
    line: "How great Thou ____!",
    answer: "art",
    hint: "a__"
  },
]

export default function FillInBlankGamePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isRevealed, setIsRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [answered, setAnswered] = useState<Record<number, boolean>>({})

  const currentQuestion = questions[currentIndex]
  const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleSubmit = () => {
    if (!isRevealed) {
      setIsRevealed(true)
      if (isCorrect && !answered[currentIndex]) {
        setScore(prev => prev + 1)
      }
      setAnswered(prev => ({ ...prev, [currentIndex]: true }))
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setUserAnswer("")
      setIsRevealed(false)
      setShowHint(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setUserAnswer("")
      setIsRevealed(false)
      setShowHint(false)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setUserAnswer("")
    setIsRevealed(false)
    setScore(0)
    setShowHint(false)
    setAnswered({})
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
              <p className="text-sm text-muted-foreground">Fill in the Blank</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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

      {/* Progress Bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Score: {score}/{questions.length}
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-game-coral rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Game Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Song Title */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-game-coral/10 text-game-coral px-4 py-2 rounded-full text-sm font-medium">
            <Music className="w-4 h-4" />
            {currentQuestion.song}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-8 shadow-soft mb-6">
          <p className="text-2xl md:text-3xl font-medium text-foreground text-center mb-8 leading-relaxed text-balance">
            {currentQuestion.line.split("____").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block mx-1 px-4 py-1 bg-primary/10 rounded-xl border-2 border-dashed border-primary min-w-[100px]">
                    {isRevealed ? (
                      <span className={isCorrect ? "text-game-green" : "text-game-coral"}>
                        {currentQuestion.answer}
                      </span>
                    ) : (
                      <span className="text-primary/50">?</span>
                    )}
                  </span>
                )}
              </span>
            ))}
          </p>

          {/* Answer Input */}
          {!isRevealed && (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && userAnswer && handleSubmit()}
                placeholder="Type your answer..."
                className="w-full px-6 py-4 bg-muted rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none text-foreground placeholder:text-muted-foreground text-xl text-center"
                autoFocus
              />

              {/* Hint */}
              {showHint && (
                <div className="text-center">
                  <span className="text-muted-foreground">Hint: </span>
                  <span className="font-mono text-lg text-primary">{currentQuestion.hint}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                {!showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
                  >
                    Need a hint?
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {isRevealed && (
            <div className="space-y-6">
              <div className={`flex items-center justify-center gap-3 p-4 rounded-2xl ${
                isCorrect ? "bg-game-green/10" : "bg-game-coral/10"
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isCorrect ? "bg-game-green" : "bg-game-coral"
                }`}>
                  {isCorrect ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <X className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-bold text-lg ${
                    isCorrect ? "text-game-green" : "text-game-coral"
                  }`}>
                    {isCorrect ? "Correct!" : "Not quite!"}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      The answer was: <span className="font-semibold">{currentQuestion.answer}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-3 rounded-xl hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-2"
                  >
                    Next Question
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="bg-game-yellow/20 text-foreground px-8 py-3 rounded-2xl font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-game-coral" />
                    All Done! Score: {score}/{questions.length}
                  </div>
                )}
                
                <button
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="p-3 rounded-xl hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Question Dots */}
        <div className="flex items-center justify-center gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i)
                setUserAnswer("")
                setIsRevealed(false)
                setShowHint(false)
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentIndex 
                  ? "bg-primary w-8" 
                  : answered[i] 
                    ? "bg-game-green" 
                    : "bg-muted hover:bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
