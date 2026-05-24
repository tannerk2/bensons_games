"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Music, 
  ChevronLeft,
  Grid3X3,
  HelpCircle,
  ListOrdered,
  Link2,
  Layers,
  LayoutGrid,
  ChevronRight,
  Check,
  Gamepad2,
  BookOpen
} from "lucide-react"

const gameTypes = [
  {
    id: "jeopardy",
    name: "Jeopardy",
    description: "Create a quiz-style game with categories and point values. Perfect for groups!",
    icon: Grid3X3,
    color: "bg-game-blue"
  },
  {
    id: "fill-in-blank",
    name: "Fill in the Blank",
    description: "Players complete missing words in lyrics. Great for memorization.",
    icon: HelpCircle,
    color: "bg-game-coral"
  },
  {
    id: "verse-order",
    name: "Verse Order",
    description: "Arrange verses or lines in the correct sequence.",
    icon: ListOrdered,
    color: "bg-game-yellow"
  },
  {
    id: "lyric-match",
    name: "Lyric Match",
    description: "Match the beginning of lines to their endings.",
    icon: Link2,
    color: "bg-game-green"
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Study cards with lyrics on one side, titles or prompts on the other.",
    icon: Layers,
    color: "bg-game-purple"
  },
  {
    id: "song-bingo",
    name: "Song Bingo",
    description: "Generate bingo cards with lyrics for group play.",
    icon: LayoutGrid,
    color: "bg-game-blue"
  },
]

const mockSongs = [
  { id: 1, title: "Amazing Grace", verses: 6 },
  { id: 2, title: "How Great Thou Art", verses: 4 },
  { id: 3, title: "It Is Well With My Soul", verses: 4 },
  { id: 4, title: "Great Is Thy Faithfulness", verses: 3 },
  { id: 5, title: "Be Thou My Vision", verses: 5 },
]

export default function CreateGamePage() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedSongs, setSelectedSongs] = useState<number[]>([])
  const [gameName, setGameName] = useState("")

  const toggleSong = (id: number) => {
    setSelectedSongs(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const selectedGameType = gameTypes.find(g => g.id === selectedType)

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
              <p className="text-sm text-muted-foreground">Learn songs through games</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link 
              href="/songs" 
              className="px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Songs
            </Link>
            <Link 
              href="/games" 
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              My Games
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Create New Game</h2>
          <p className="text-muted-foreground">
            Choose a game type and select songs to include.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                step >= s ? "text-foreground" : "text-muted-foreground"
              }`}>
                {s === 1 ? "Game Type" : s === 2 ? "Select Songs" : "Settings"}
              </span>
              {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Game Type Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Choose a Game Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameTypes.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedType(game.id)}
                  className={`bg-white rounded-3xl p-6 shadow-soft text-left transition-all hover:-translate-y-1 border-3 ${
                    selectedType === game.id 
                      ? "border-primary ring-4 ring-primary/20" 
                      : "border-transparent hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <game.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-foreground mb-1">{game.name}</h4>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </div>
                    {selectedType === game.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end pt-6">
              <button
                onClick={() => selectedType && setStep(2)}
                disabled={!selectedType}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Song Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              {selectedGameType && (
                <div className={`w-12 h-12 ${selectedGameType.color} rounded-xl flex items-center justify-center`}>
                  <selectedGameType.icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">Select Songs for {selectedGameType?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedSongs.length} songs selected</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-soft divide-y divide-border">
              {mockSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => toggleSong(song.id)}
                  className={`w-full p-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors first:rounded-t-3xl last:rounded-b-3xl ${
                    selectedSongs.includes(song.id) ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    selectedSongs.includes(song.id) 
                      ? "bg-primary border-primary" 
                      : "border-border"
                  }`}>
                    {selectedSongs.includes(song.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="w-10 h-10 bg-game-coral/20 rounded-xl flex items-center justify-center">
                    <Music className="w-5 h-5 text-game-coral" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{song.title}</h4>
                    <p className="text-sm text-muted-foreground">{song.verses} verses</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => selectedSongs.length > 0 && setStep(3)}
                disabled={selectedSongs.length === 0}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Game Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              {selectedGameType && (
                <div className={`w-12 h-12 ${selectedGameType.color} rounded-xl flex items-center justify-center`}>
                  <selectedGameType.icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">Configure Your {selectedGameType?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedSongs.length} songs selected</p>
              </div>
            </div>

            {/* Game Name */}
            <div className="bg-white rounded-3xl p-6 shadow-soft">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Game Name
              </label>
              <input
                type="text"
                placeholder="e.g., Sunday School Hymn Quiz"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none text-foreground placeholder:text-muted-foreground text-lg"
              />
            </div>

            {/* Game-specific settings preview */}
            <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
              <h4 className="font-semibold text-foreground">Game Settings</h4>
              
              {selectedType === "jeopardy" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Number of Categories</label>
                    <select className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none text-foreground">
                      <option>3 categories</option>
                      <option>4 categories</option>
                      <option>5 categories</option>
                      <option>6 categories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Point Values</label>
                    <select className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none text-foreground">
                      <option>100, 200, 300, 400, 500</option>
                      <option>200, 400, 600, 800, 1000</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedType === "fill-in-blank" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Difficulty</label>
                    <select className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none text-foreground">
                      <option>Easy - Blank 1 word per line</option>
                      <option>Medium - Blank 2-3 words per line</option>
                      <option>Hard - Blank half the line</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Show Hints</label>
                    <select className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none text-foreground">
                      <option>Yes - Show first letter</option>
                      <option>No hints</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedType === "flashcards" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Card Front</label>
                    <select className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none text-foreground">
                      <option>Lyric line</option>
                      <option>Song title</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Card Back</label>
                    <select className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:outline-none text-foreground">
                      <option>Song title</option>
                      <option>Next line</option>
                    </select>
                  </div>
                </div>
              )}

              {!["jeopardy", "fill-in-blank", "flashcards"].includes(selectedType || "") && (
                <p className="text-muted-foreground text-sm">
                  Additional settings will appear here based on the game type.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                disabled={!gameName}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Game
                <Gamepad2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
