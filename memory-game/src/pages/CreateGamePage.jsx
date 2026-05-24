import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  HelpCircle,
  ListOrdered,
  Link2,
  Layers,
  LayoutGrid,
  Check,
  Music,
  Settings,
  Sparkles
} from "lucide-react"

const gameTypes = [
  { id: "jeopardy", name: "Jeopardy", icon: Grid3X3, color: "bg-game-blue", description: "Quiz-style game with categories and point values" },
  { id: "fill-in-blank", name: "Fill in the Blank", icon: HelpCircle, color: "bg-game-coral", description: "Complete the missing words in lyrics" },
  { id: "verse-order", name: "Verse Order", icon: ListOrdered, color: "bg-game-yellow", description: "Put verses in the correct sequence" },
  { id: "lyric-match", name: "Lyric Match", icon: Link2, color: "bg-game-green", description: "Match line beginnings to endings" },
  { id: "flashcards", name: "Flashcards", icon: Layers, color: "bg-game-purple", description: "Study cards for memorization" },
  { id: "song-bingo", name: "Song Bingo", icon: LayoutGrid, color: "bg-game-blue", description: "Fun group activity with lyrics" },
]

const songs = [
  { id: 1, title: "Amazing Grace", verses: 5 },
  { id: 2, title: "How Great Thou Art", verses: 4 },
  { id: 3, title: "Be Thou My Vision", verses: 5 },
  { id: 4, title: "It Is Well With My Soul", verses: 4 },
]

export default function CreateGamePage() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedSongs, setSelectedSongs] = useState([])
  const [gameName, setGameName] = useState("")

  const selectedGameType = gameTypes.find(g => g.id === selectedType)

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[var(--color-primary)]/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 bg-[var(--color-muted)] rounded-xl flex items-center justify-center hover:bg-[var(--color-muted)]/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-[var(--color-foreground)]" />
            </Link>
            <h1 className="text-xl font-bold text-[var(--color-foreground)]">Create New Game</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-8 h-1 mx-1 rounded ${
                    step > s ? "bg-[var(--color-primary)]" : "bg-[var(--color-muted)]"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Choose Game Type */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Choose a Game Type</h2>
              <p className="text-[var(--color-muted-foreground)]">Select the type of game you want to create</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {gameTypes.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedType(game.id)}
                  className={`text-left bg-white rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all border-3 ${
                    selectedType === game.id 
                      ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20" 
                      : "border-transparent hover:border-[var(--color-primary)]/30"
                  }`}
                >
                  <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <game.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-1">{game.name}</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{game.description}</p>
                  {selectedType === game.id && (
                    <div className="mt-4 flex items-center gap-2 text-[var(--color-primary)] font-medium">
                      <Check className="w-5 h-5" />
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => selectedType && setStep(2)}
                disabled={!selectedType}
                className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
                  selectedType 
                    ? "bg-[var(--color-primary)] text-white hover:opacity-90" 
                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed"
                }`}
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Songs */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Select Songs</h2>
              <p className="text-[var(--color-muted-foreground)]">Choose songs to include in your {selectedGameType?.name} game</p>
            </div>

            <div className="space-y-3 mb-8">
              {songs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => {
                    if (selectedSongs.includes(song.id)) {
                      setSelectedSongs(selectedSongs.filter(id => id !== song.id))
                    } else {
                      setSelectedSongs([...selectedSongs, song.id])
                    }
                  }}
                  className={`w-full text-left bg-white rounded-2xl p-5 shadow-soft hover:shadow-lg transition-all flex items-center gap-4 border-3 ${
                    selectedSongs.includes(song.id)
                      ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20"
                      : "border-transparent hover:border-[var(--color-primary)]/30"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedSongs.includes(song.id) ? "bg-[var(--color-primary)]" : "bg-[var(--color-muted)]"
                  }`}>
                    {selectedSongs.includes(song.id) ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Music className="w-6 h-6 text-[var(--color-muted-foreground)]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-foreground)]">{song.title}</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{song.verses} verses</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl font-semibold bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => selectedSongs.length > 0 && setStep(3)}
                disabled={selectedSongs.length === 0}
                className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
                  selectedSongs.length > 0
                    ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed"
                }`}
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configure & Name */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Configure Your Game</h2>
              <p className="text-[var(--color-muted-foreground)]">Name your game and adjust settings</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-soft mb-6">
              <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
                Game Name
              </label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter a name for your game..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-muted)] border-2 border-transparent focus:border-[var(--color-primary)] focus:bg-white focus:outline-none transition-all text-lg font-medium text-[var(--color-foreground)]"
              />
            </div>

            {/* Game-specific settings preview */}
            <div className="bg-white rounded-3xl p-6 shadow-soft mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${selectedGameType?.color} rounded-xl flex items-center justify-center`}>
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--color-foreground)]">Game Settings</h3>
              </div>
              
              {selectedType === "jeopardy" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-2">Number of Categories</label>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6].map((n) => (
                        <button key={n} className="flex-1 py-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-primary)] hover:text-white font-medium transition-colors">
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-2">Point Values</label>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium">100-500</button>
                      <button className="flex-1 py-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-primary)] hover:text-white font-medium transition-colors">200-1000</button>
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "fill-in-blank" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-2">Difficulty</label>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-xl bg-[var(--color-game-green)] text-white font-medium">Easy</button>
                      <button className="flex-1 py-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-game-yellow)] font-medium transition-colors">Medium</button>
                      <button className="flex-1 py-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-game-coral)] hover:text-white font-medium transition-colors">Hard</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-2">Show Hints</label>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium">Yes</button>
                      <button className="flex-1 py-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-primary)] hover:text-white font-medium transition-colors">No</button>
                    </div>
                  </div>
                </div>
              )}

              {!["jeopardy", "fill-in-blank"].includes(selectedType) && (
                <p className="text-[var(--color-muted-foreground)] text-center py-4">Default settings will be applied. You can customize them later.</p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-[var(--color-game-green)]/20 rounded-2xl p-5 mb-8">
              <h3 className="font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-game-green)]" />
                Game Summary
              </h3>
              <ul className="text-sm text-[var(--color-muted-foreground)] space-y-1">
                <li>• Game Type: <strong className="text-[var(--color-foreground)]">{selectedGameType?.name}</strong></li>
                <li>• Songs: <strong className="text-[var(--color-foreground)]">{selectedSongs.length} selected</strong></li>
                <li>• Name: <strong className="text-[var(--color-foreground)]">{gameName || "(not set)"}</strong></li>
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl font-semibold bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                disabled={!gameName}
                className={`px-8 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
                  gameName
                    ? "bg-[var(--color-game-green)] text-white hover:opacity-90"
                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Create Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
