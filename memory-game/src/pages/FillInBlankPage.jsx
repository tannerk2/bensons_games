import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Check,
  X,
  RefreshCw,
  Trophy
} from "lucide-react"

const questions = [
  {
    id: 1,
    lyric: "Amazing grace, how sweet the _____, that saved a wretch like me",
    answer: "sound",
    hint: "Something you hear",
    song: "Amazing Grace"
  },
  {
    id: 2,
    lyric: "I once was _____, but now am found",
    answer: "lost",
    hint: "The opposite of found",
    song: "Amazing Grace"
  },
  {
    id: 3,
    lyric: "Was blind but now I _____",
    answer: "see",
    hint: "What eyes do",
    song: "Amazing Grace"
  },
]

export default function FillInBlankPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [showResult, setShowResult] = useState(null)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(0)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const checkAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
    setShowResult(isCorrect)
    if (isCorrect) {
      setScore(score + 1)
    }
    setCompleted(completed + 1)
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer("")
      setShowHint(false)
      setShowResult(null)
    }
  }

  const resetGame = () => {
    setCurrentIndex(0)
    setUserAnswer("")
    setShowHint(false)
    setShowResult(null)
    setScore(0)
    setCompleted(0)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-[var(--color-game-coral)] text-white py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Fill in the Blank</h1>
              <p className="text-sm text-white/80">Amazing Grace Practice</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-4 py-2">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">{score}/{completed}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)] mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-game-coral)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8 shadow-soft">
          {/* Song Label */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 bg-[var(--color-game-coral)]/20 text-[var(--color-game-coral)] rounded-full text-sm font-semibold">
              {currentQuestion.song}
            </span>
          </div>

          {/* Lyric with Blank */}
          <div className="text-center mb-8">
            <p className="text-xl md:text-2xl text-[var(--color-foreground)] leading-relaxed">
              {currentQuestion.lyric.split("_____")[0]}
              <span className="inline-block mx-2 min-w-[120px] border-b-4 border-[var(--color-game-coral)] border-dashed">
                {showResult !== null ? (
                  <span className={`font-bold ${showResult ? "text-[var(--color-game-green)]" : "text-[var(--color-game-coral)]"}`}>
                    {currentQuestion.answer}
                  </span>
                ) : userAnswer ? (
                  <span className="text-[var(--color-primary)]">{userAnswer}</span>
                ) : (
                  <span className="text-[var(--color-muted-foreground)]">?</span>
                )}
              </span>
              {currentQuestion.lyric.split("_____")[1]}
            </p>
          </div>

          {/* Input Area */}
          {showResult === null && (
            <>
              <div className="mb-6">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && userAnswer && checkAnswer()}
                  placeholder="Type the missing word..."
                  className="w-full px-6 py-4 rounded-2xl bg-[var(--color-muted)] border-2 border-transparent focus:border-[var(--color-game-coral)] focus:bg-white focus:outline-none transition-all text-center text-lg font-medium text-[var(--color-foreground)]"
                  autoFocus
                />
              </div>

              {/* Hint */}
              {showHint && (
                <div className="bg-[var(--color-game-yellow)]/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-[var(--color-game-yellow)] flex-shrink-0" />
                  <p className="text-[var(--color-foreground)]">
                    <strong>Hint:</strong> {currentQuestion.hint}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="flex-1 py-3 rounded-2xl bg-[var(--color-game-yellow)]/20 text-[var(--color-game-yellow)] font-semibold hover:bg-[var(--color-game-yellow)]/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Show Hint
                  </button>
                )}
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer}
                  className={`flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    userAnswer
                      ? "bg-[var(--color-game-coral)] text-white hover:opacity-90"
                      : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed"
                  }`}
                >
                  <Check className="w-5 h-5" />
                  Check Answer
                </button>
              </div>
            </>
          )}

          {/* Result */}
          {showResult !== null && (
            <div className="text-center">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-6 ${
                showResult 
                  ? "bg-[var(--color-game-green)]/20 text-[var(--color-game-green)]" 
                  : "bg-[var(--color-game-coral)]/20 text-[var(--color-game-coral)]"
              }`}>
                {showResult ? (
                  <>
                    <Check className="w-6 h-6" />
                    <span className="text-lg font-bold">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6" />
                    <span className="text-lg font-bold">Not quite - the answer was "{currentQuestion.answer}"</span>
                  </>
                )}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Next Question
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div>
                  <div className="bg-[var(--color-game-green)]/20 rounded-2xl p-6 mb-4">
                    <Trophy className="w-12 h-12 text-[var(--color-game-green)] mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-[var(--color-foreground)]">Game Complete!</h3>
                    <p className="text-[var(--color-muted-foreground)]">You scored {score} out of {questions.length}</p>
                  </div>
                  <button
                    onClick={resetGame}
                    className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
