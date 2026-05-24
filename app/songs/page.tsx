"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Music, 
  Plus, 
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  FileText,
  Gamepad2,
  BookOpen
} from "lucide-react"

const mockSongs = [
  {
    id: 1,
    title: "Amazing Grace",
    verseCount: 6,
    gamesCount: 4,
    createdAt: "Dec 15, 2024"
  },
  {
    id: 2,
    title: "How Great Thou Art",
    verseCount: 4,
    gamesCount: 2,
    createdAt: "Dec 14, 2024"
  },
  {
    id: 3,
    title: "It Is Well With My Soul",
    verseCount: 4,
    gamesCount: 3,
    createdAt: "Dec 12, 2024"
  },
  {
    id: 4,
    title: "Great Is Thy Faithfulness",
    verseCount: 3,
    gamesCount: 1,
    createdAt: "Dec 10, 2024"
  },
  {
    id: 5,
    title: "Be Thou My Vision",
    verseCount: 5,
    gamesCount: 2,
    createdAt: "Dec 8, 2024"
  },
  {
    id: 6,
    title: "Holy, Holy, Holy",
    verseCount: 4,
    gamesCount: 0,
    createdAt: "Dec 5, 2024"
  },
]

export default function SongsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openMenu, setOpenMenu] = useState<number | null>(null)

  const filteredSongs = mockSongs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Songs
            </Link>
            <Link 
              href="/games" 
              className="px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              My Games
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Song Library</h2>
            <p className="text-muted-foreground">
              {mockSongs.length} songs in your collection
            </p>
          </div>
          <button className="bg-primary text-white px-5 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-2 w-fit">
            <Plus className="w-5 h-5" />
            Add New Song
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-2 border-border focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all group relative"
            >
              {/* Menu Button */}
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setOpenMenu(openMenu === song.id ? null : song.id)}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
                {openMenu === song.id && (
                  <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[140px] z-10">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-500">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Song Icon */}
              <div className="w-14 h-14 bg-game-coral rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-white" />
              </div>

              {/* Song Info */}
              <h3 className="text-xl font-bold text-foreground mb-2 pr-8">{song.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{song.verseCount} verses</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                <span>{song.gamesCount} games</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  View Lyrics
                </button>
                <button className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  Create Game
                </button>
              </div>

              {/* Date */}
              <p className="text-xs text-muted-foreground mt-4">Added {song.createdAt}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSongs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No songs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : "Add your first song to get started"}
            </p>
            <button className="bg-primary text-white px-5 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              Add New Song
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
