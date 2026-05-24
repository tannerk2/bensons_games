import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Music
} from "lucide-react"

export default function AddSongPage() {
  const [title, setTitle] = useState("")
  const [verses, setVerses] = useState([
    { id: 1, type: "verse", number: 1, lyrics: "" },
  ])

  const addVerse = () => {
    const verseCount = verses.filter(v => v.type === "verse").length
    setVerses([...verses, { 
      id: Date.now(), 
      type: "verse", 
      number: verseCount + 1, 
      lyrics: "" 
    }])
  }

  const addChorus = () => {
    setVerses([...verses, { 
      id: Date.now(), 
      type: "chorus", 
      lyrics: "" 
    }])
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[var(--color-primary)]/20 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/songs" className="w-10 h-10 bg-[var(--color-muted)] rounded-xl flex items-center justify-center hover:bg-[var(--color-muted)]/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-[var(--color-foreground)]" />
            </Link>
            <h1 className="text-xl font-bold text-[var(--color-foreground)]">Add New Song</h1>
          </div>
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Song
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Song Title */}
        <div className="bg-white rounded-3xl p-6 shadow-soft mb-6">
          <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
            Song Title
          </label>
          <div className="relative">
            <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the song title..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[var(--color-muted)] border-2 border-transparent focus:border-[var(--color-primary)] focus:bg-white focus:outline-none transition-all text-lg font-medium text-[var(--color-foreground)]"
            />
          </div>
        </div>

        {/* Verses */}
        <div className="space-y-4 mb-6">
          {verses.map((verse, index) => (
            <div key={verse.id} className="bg-white rounded-3xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  verse.type === "chorus" 
                    ? "bg-[var(--color-game-coral)]/20 text-[var(--color-game-coral)]" 
                    : "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                }`}>
                  {verse.type === "chorus" ? "Chorus" : `Verse ${verse.number}`}
                </span>
                {verses.length > 1 && (
                  <button 
                    onClick={() => setVerses(verses.filter(v => v.id !== verse.id))}
                    className="w-8 h-8 bg-[var(--color-muted)] rounded-lg flex items-center justify-center hover:bg-[var(--color-game-coral)] hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={verse.lyrics}
                onChange={(e) => setVerses(verses.map(v => 
                  v.id === verse.id ? { ...v, lyrics: e.target.value } : v
                ))}
                placeholder={verse.type === "chorus" ? "Enter chorus lyrics..." : "Enter verse lyrics..."}
                rows={4}
                className="w-full p-4 rounded-2xl bg-[var(--color-muted)] border-2 border-transparent focus:border-[var(--color-primary)] focus:bg-white focus:outline-none transition-all resize-none text-[var(--color-foreground)]"
              />
            </div>
          ))}
        </div>

        {/* Add Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={addVerse}
            className="flex-1 bg-white rounded-2xl p-4 shadow-soft hover:shadow-lg transition-all flex items-center justify-center gap-2 text-[var(--color-primary)] font-semibold border-2 border-dashed border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]"
          >
            <Plus className="w-5 h-5" />
            Add Verse
          </button>
          <button
            onClick={addChorus}
            className="flex-1 bg-white rounded-2xl p-4 shadow-soft hover:shadow-lg transition-all flex items-center justify-center gap-2 text-[var(--color-game-coral)] font-semibold border-2 border-dashed border-[var(--color-game-coral)]/30 hover:border-[var(--color-game-coral)]"
          >
            <Plus className="w-5 h-5" />
            Add Chorus
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-[var(--color-game-yellow)]/20 rounded-2xl p-5">
          <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Tips for adding songs</h3>
          <ul className="text-sm text-[var(--color-muted-foreground)] space-y-1">
            <li>• Add each verse and chorus separately for better game creation</li>
            <li>• Include punctuation to help with fill-in-the-blank games</li>
            <li>• You can edit songs anytime from the Song Library</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
