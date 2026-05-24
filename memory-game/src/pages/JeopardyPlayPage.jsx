import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  ChevronLeft,
  Users,
  Trophy,
  X,
  Check
} from "lucide-react"

const categories = [
  { name: "Amazing Grace", color: "bg-game-blue" },
  { name: "How Great Thou Art", color: "bg-game-coral" },
  { name: "Be Thou My Vision", color: "bg-game-green" },
  { name: "It Is Well", color: "bg-game-purple" },
  { name: "Great Is Thy Faithfulness", color: "bg-game-yellow" },
]

const pointValues = [100, 200, 300, 400, 500]

export default function JeopardyPlayPage() {
  const [scores, setScores] = useState({ team1: 400, team2: 300 })
  const [answeredCells, setAnsweredCells] = useState(new Set(["0-0", "1-2", "2-1", "3-0", "4-3"]))
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)

  const handleCellClick = (categoryIndex, pointIndex) => {
    const cellId = `${categoryIndex}-${pointIndex}`
    if (!answeredCells.has(cellId)) {
      setCurrentQuestion({
        category: categories[categoryIndex].name,
        points: pointValues[pointIndex],
        question: "Complete this lyric: \"Amazing grace, how sweet the ___\"",
        answer: "sound"
      })
      setShowQuestion(true)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-[var(--color-primary)] text-white py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Hymn Jeopardy</h1>
              <p className="text-sm text-white/80">Christmas Hymns Edition</p>
            </div>
          </div>
          
          {/* Team Scores */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-4 py-2">
              <div className="w-8 h-8 bg-[var(--color-game-coral)] rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-white/70">Team 1</div>
                <div className="text-lg font-bold">${scores.team1}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-4 py-2">
              <div className="w-8 h-8 bg-[var(--color-game-green)] rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-white/70">Team 2</div>
                <div className="text-lg font-bold">${scores.team2}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Board */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
          {/* Category Headers */}
          <div className="grid grid-cols-5">
            {categories.map((cat, index) => (
              <div key={index} className={`${cat.color} py-4 px-2 text-center`}>
                <h3 className="text-white font-bold text-sm md:text-base leading-tight">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>

          {/* Point Cells */}
          {pointValues.map((points, pointIndex) => (
            <div key={pointIndex} className="grid grid-cols-5 border-t border-[var(--color-border)]">
              {categories.map((cat, catIndex) => {
                const cellId = `${catIndex}-${pointIndex}`
                const isAnswered = answeredCells.has(cellId)
                return (
                  <button
                    key={catIndex}
                    onClick={() => handleCellClick(catIndex, pointIndex)}
                    disabled={isAnswered}
                    className={`py-6 md:py-8 text-center font-bold text-xl md:text-2xl transition-all ${
                      isAnswered
                        ? "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                        : `${cat.color}/10 text-[var(--color-foreground)] hover:${cat.color}/20 hover:scale-105 cursor-pointer`
                    } ${catIndex > 0 ? "border-l border-[var(--color-border)]" : ""}`}
                  >
                    {isAnswered ? "-" : `$${points}`}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Question Modal */}
      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-sm font-medium text-[var(--color-muted-foreground)]">{currentQuestion.category}</span>
                <div className="text-3xl font-bold text-[var(--color-primary)]">${currentQuestion.points}</div>
              </div>
              <button 
                onClick={() => setShowQuestion(false)}
                className="w-10 h-10 bg-[var(--color-muted)] rounded-xl flex items-center justify-center hover:bg-[var(--color-game-coral)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[var(--color-primary)]/10 rounded-2xl p-6 mb-6">
              <p className="text-xl text-[var(--color-foreground)] text-center font-medium">
                {currentQuestion.question}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => {
                  setScores({ ...scores, team1: scores.team1 + currentQuestion.points })
                  setAnsweredCells(new Set([...answeredCells, `${categories.findIndex(c => c.name === currentQuestion.category)}-${pointValues.indexOf(currentQuestion.points)}`]))
                  setShowQuestion(false)
                }}
                className="flex-1 py-4 rounded-2xl bg-[var(--color-game-coral)] text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Team 1
              </button>
              <button 
                onClick={() => {
                  setScores({ ...scores, team2: scores.team2 + currentQuestion.points })
                  setAnsweredCells(new Set([...answeredCells, `${categories.findIndex(c => c.name === currentQuestion.category)}-${pointValues.indexOf(currentQuestion.points)}`]))
                  setShowQuestion(false)
                }}
                className="flex-1 py-4 rounded-2xl bg-[var(--color-game-green)] text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Team 2
              </button>
              <button 
                onClick={() => {
                  setAnsweredCells(new Set([...answeredCells, `${categories.findIndex(c => c.name === currentQuestion.category)}-${pointValues.indexOf(currentQuestion.points)}`]))
                  setShowQuestion(false)
                }}
                className="px-6 py-4 rounded-2xl bg-[var(--color-muted)] text-[var(--color-foreground)] font-bold hover:bg-[var(--color-muted)]/80 transition-colors"
              >
                No Answer
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <button 
                onClick={() => setShowQuestion(false)}
                className="w-full py-3 text-[var(--color-primary)] font-medium hover:underline flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Reveal Answer: "{currentQuestion.answer}"
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
