"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Music, 
  ChevronLeft,
  X,
  Users,
  Trophy,
  RotateCcw,
  Home,
  Gamepad2,
  BookOpen
} from "lucide-react"

const categories = [
  { id: 1, name: "Amazing Grace" },
  { id: 2, name: "How Great Thou Art" },
  { id: 3, name: "It Is Well" },
  { id: 4, name: "Great Faithfulness" },
]

const pointValues = [100, 200, 300, 400, 500]

// Mock questions for each category/value
const questions: Record<string, { question: string; answer: string }> = {
  "1-100": { question: "Complete: 'Amazing grace, how sweet the ___'", answer: "sound" },
  "1-200": { question: "What saved 'a wretch like me'?", answer: "Grace" },
  "1-300": { question: "Complete: 'I once was lost but now am ___'", answer: "found" },
  "2-100": { question: "Complete: 'Then sings my soul, my Savior God to ___'", answer: "Thee" },
  "2-200": { question: "What does my soul sing in this hymn?", answer: "How great Thou art" },
}

type Team = {
  name: string
  score: number
  color: string
}

export default function JeopardyGamePage() {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [answeredCells, setAnsweredCells] = useState<Set<string>>(new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [teams, setTeams] = useState<Team[]>([
    { name: "Team Blue", score: 0, color: "bg-game-blue" },
    { name: "Team Coral", score: 0, color: "bg-game-coral" },
  ])

  const handleCellClick = (catId: number, points: number) => {
    const key = `${catId}-${points}`
    if (!answeredCells.has(key)) {
      setSelectedCell(key)
      setShowAnswer(false)
    }
  }

  const handleCorrect = (teamIndex: number) => {
    if (selectedCell) {
      const points = parseInt(selectedCell.split("-")[1])
      setTeams(prev => prev.map((team, i) => 
        i === teamIndex ? { ...team, score: team.score + points } : team
      ))
      setAnsweredCells(prev => new Set([...prev, selectedCell]))
      setSelectedCell(null)
    }
  }

  const handleIncorrect = () => {
    if (selectedCell) {
      setAnsweredCells(prev => new Set([...prev, selectedCell]))
      setSelectedCell(null)
    }
  }

  const currentQuestion = selectedCell ? questions[selectedCell] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b-4 border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">HymnPlay</h1>
              <p className="text-sm text-muted-foreground">Learn songs through games</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2">
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

      {/* Team Scores */}
      <div className="bg-white border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8">
          {teams.map((team, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-10 h-10 ${team.color} rounded-xl flex items-center justify-center`}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{team.name}</p>
                <p className="text-2xl font-bold text-foreground">{team.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-game-blue rounded-3xl p-4 shadow-lg overflow-hidden">
          {/* Category Headers */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className="bg-game-blue/80 rounded-2xl py-4 px-2 text-center"
              >
                <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-wide">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>

          {/* Point Grid */}
          {pointValues.map((points) => (
            <div key={points} className="grid grid-cols-4 gap-2 mb-2">
              {categories.map((cat) => {
                const key = `${cat.id}-${points}`
                const isAnswered = answeredCells.has(key)
                return (
                  <button
                    key={key}
                    onClick={() => handleCellClick(cat.id, points)}
                    disabled={isAnswered}
                    className={`py-6 md:py-8 rounded-2xl font-bold text-2xl md:text-3xl transition-all ${
                      isAnswered 
                        ? "bg-game-blue/40 text-transparent cursor-default" 
                        : "bg-primary hover:bg-primary/90 text-game-yellow hover:scale-105 shadow-md cursor-pointer"
                    }`}
                  >
                    ${points}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Question Modal */}
      {selectedCell && currentQuestion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-game-yellow" />
                <span className="text-white font-bold text-xl">
                  ${selectedCell.split("-")[1]}
                </span>
              </div>
              <button 
                onClick={() => setSelectedCell(null)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Question */}
            <div className="p-8 text-center">
              <p className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-balance">
                {currentQuestion.question}
              </p>

              {/* Show Answer Button */}
              {!showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-2xl font-semibold transition-colors"
                >
                  Reveal Answer
                </button>
              )}

              {/* Answer */}
              {showAnswer && (
                <div className="space-y-6">
                  <div className="bg-game-green/10 rounded-2xl p-6 border-2 border-game-green">
                    <p className="text-sm text-game-green font-medium mb-1">Answer:</p>
                    <p className="text-3xl font-bold text-game-green">
                      {currentQuestion.answer}
                    </p>
                  </div>

                  {/* Score Buttons */}
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Who got it right?</p>
                    <div className="flex items-center justify-center gap-3">
                      {teams.map((team, index) => (
                        <button
                          key={index}
                          onClick={() => handleCorrect(index)}
                          className={`${team.color} text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2`}
                        >
                          <Trophy className="w-5 h-5" />
                          {team.name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleIncorrect}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      No one got it
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
