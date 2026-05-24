import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  Music, 
  Gamepad2, 
  BookOpen, 
  Sparkles,
  Grid3X3,
  ListOrdered,
  Link2,
  Layers,
  LayoutGrid,
  HelpCircle,
  ChevronRight,
  Play
} from "lucide-react"

const gameTypes = [
  {
    id: "jeopardy",
    name: "Jeopardy",
    description: "Quiz-style game with categories and points",
    icon: Grid3X3,
    color: "bg-game-blue",
    games: 3
  },
  {
    id: "fill-in-blank",
    name: "Fill in the Blank",
    description: "Complete the missing lyrics",
    icon: HelpCircle,
    color: "bg-game-coral",
    games: 5
  },
  {
    id: "verse-order",
    name: "Verse Order",
    description: "Put verses in the correct sequence",
    icon: ListOrdered,
    color: "bg-game-yellow",
    games: 2
  },
  {
    id: "lyric-match",
    name: "Lyric Match",
    description: "Match line beginnings to endings",
    icon: Link2,
    color: "bg-game-green",
    games: 4
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Study cards for memorization",
    icon: Layers,
    color: "bg-game-purple",
    games: 6
  },
  {
    id: "song-bingo",
    name: "Song Bingo",
    description: "Fun group activity with lyrics",
    icon: LayoutGrid,
    color: "bg-game-blue",
    games: 2
  },
]

const recentGames = [
  { id: 1, name: "Christmas Hymns Jeopardy", type: "jeopardy", lastPlayed: "2 hours ago" },
  { id: 2, name: "Amazing Grace Fill-in", type: "fill-in-blank", lastPlayed: "Yesterday" },
  { id: 3, name: "Praise Songs Flashcards", type: "flashcards", lastPlayed: "3 days ago" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[var(--color-primary)]/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-foreground)]">HymnPlay</h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">Learn songs through games</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link 
              to="/songs" 
              className="px-4 py-2 rounded-xl text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors font-medium flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Songs
            </Link>
            <Link 
              to="/games/create" 
              className="px-4 py-2 rounded-xl text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors font-medium flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              Create Game
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[var(--color-primary)]/10 to-[var(--color-background)] py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-[var(--color-primary)] mb-6 shadow-soft">
            <Sparkles className="w-4 h-4" />
            Making hymn learning fun!
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Learn Your Favorite Songs<br />Through Play
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto mb-8">
            Create custom games from any hymn or song. Perfect for Sunday school, 
            family devotions, or personal study.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link 
              to="/games/create"
              className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-soft flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              Create a Game
            </Link>
            <Link 
              to="/songs"
              className="bg-white text-[var(--color-foreground)] px-6 py-3 rounded-2xl font-semibold hover:bg-[var(--color-muted)] transition-colors shadow-soft flex items-center gap-2"
            >
              <Music className="w-5 h-5" />
              Add Songs
            </Link>
          </div>
        </div>
      </section>

      {/* Game Types Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-[var(--color-foreground)]">Choose a Game Type</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameTypes.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}/play`}
                className="group bg-white rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-[var(--color-primary)]/20"
              >
                <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <game.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[var(--color-foreground)] mb-2">{game.name}</h4>
                <p className="text-[var(--color-muted-foreground)] text-sm mb-4">{game.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-[var(--color-muted)] px-3 py-1 rounded-full font-medium">
                    {game.games} games
                  </span>
                  <span className="text-[var(--color-primary)] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Play <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-8">Continue Playing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentGames.map((game) => {
              const gameType = gameTypes.find(t => t.id === game.type)
              return (
                <div
                  key={game.id}
                  className="bg-[var(--color-muted)]/50 rounded-2xl p-5 flex items-center gap-4 hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
                >
                  <div className={`w-12 h-12 ${gameType?.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {gameType && <gameType.icon className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--color-foreground)] truncate">{game.name}</h4>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{game.lastPlayed}</p>
                  </div>
                  <button className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-game-coral)] rounded-3xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-1">12</div>
                <div className="text-white/80 text-sm">Songs Added</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">22</div>
                <div className="text-white/80 text-sm">Games Created</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">48</div>
                <div className="text-white/80 text-sm">Games Played</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">6</div>
                <div className="text-white/80 text-sm">Game Types</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto text-center text-[var(--color-muted-foreground)] text-sm">
          <p>HymnPlay - Making hymn learning fun for kids and families</p>
        </div>
      </footer>
    </div>
  )
}
