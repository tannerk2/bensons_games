import { Link } from "react-router-dom"
import { 
  Music, 
  Plus, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ChevronLeft,
  BookOpen
} from "lucide-react"

const songs = [
  { 
    id: 1, 
    title: "Amazing Grace", 
    verses: 5,
    lastUsed: "2 days ago",
    gamesUsedIn: 4
  },
  { 
    id: 2, 
    title: "How Great Thou Art", 
    verses: 4,
    lastUsed: "1 week ago",
    gamesUsedIn: 3
  },
  { 
    id: 3, 
    title: "Be Thou My Vision", 
    verses: 5,
    lastUsed: "3 days ago",
    gamesUsedIn: 2
  },
  { 
    id: 4, 
    title: "It Is Well With My Soul", 
    verses: 4,
    lastUsed: "Yesterday",
    gamesUsedIn: 5
  },
  { 
    id: 5, 
    title: "Great Is Thy Faithfulness", 
    verses: 3,
    lastUsed: "5 days ago",
    gamesUsedIn: 2
  },
]

export default function SongsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[var(--color-primary)]/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 bg-[var(--color-muted)] rounded-xl flex items-center justify-center hover:bg-[var(--color-muted)]/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-[var(--color-foreground)]" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-foreground)]">Song Library</h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">{songs.length} songs</p>
            </div>
          </div>
          <Link 
            to="/songs/new"
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Song
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search songs..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-2 border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-foreground)]"
          />
        </div>
      </div>

      {/* Song List */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="space-y-3">
          {songs.map((song) => (
            <div
              key={song.id}
              className="bg-white rounded-2xl p-5 shadow-soft hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-game-coral)] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Music className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-[var(--color-foreground)]">{song.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
                    <span>{song.verses} verses</span>
                    <span>•</span>
                    <span>Used in {song.gamesUsedIn} games</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 bg-[var(--color-muted)] rounded-xl flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-[var(--color-muted)] rounded-xl flex items-center justify-center hover:bg-[var(--color-game-coral)] hover:text-white transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (hidden when songs exist) */}
        {songs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--color-muted)] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-[var(--color-muted-foreground)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">No songs yet</h3>
            <p className="text-[var(--color-muted-foreground)] mb-6">Add your first song to start creating games</p>
            <Link 
              to="/songs/new"
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Your First Song
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
