"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Music, 
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  Gamepad2,
  BookOpen
} from "lucide-react"

export default function AddSongPage() {
  const [title, setTitle] = useState("")
  const [verses, setVerses] = useState([
    { id: 1, label: "Verse 1", content: "" },
    { id: 2, label: "Chorus", content: "" },
  ])

  const addVerse = () => {
    const newId = Math.max(...verses.map(v => v.id)) + 1
    setVerses([...verses, { id: newId, label: `Verse ${newId}`, content: "" }])
  }

  const removeVerse = (id: number) => {
    if (verses.length > 1) {
      setVerses(verses.filter(v => v.id !== id))
    }
  }

  const updateVerse = (id: number, field: "label" | "content", value: string) => {
    setVerses(verses.map(v => v.id === id ? { ...v, [field]: value } : v))
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
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          href="/songs" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Songs
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Add New Song</h2>
          <p className="text-muted-foreground">
            Enter the song title and lyrics. You can organize by verses, chorus, and bridge.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Song Title */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Song Title
            </label>
            <input
              type="text"
              placeholder="e.g., Amazing Grace"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none text-foreground placeholder:text-muted-foreground text-lg"
            />
          </div>

          {/* Verses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Lyrics</h3>
              <button
                onClick={addVerse}
                className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {verses.map((verse, index) => (
              <div key={verse.id} className="bg-white rounded-3xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={verse.label}
                    onChange={(e) => updateVerse(verse.id, "label", e.target.value)}
                    className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg border-2 border-transparent focus:border-primary focus:outline-none"
                  />
                  {verses.length > 1 && (
                    <button
                      onClick={() => removeVerse(verse.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Enter lyrics here...&#10;&#10;Each line will be used for games"
                  value={verse.content}
                  onChange={(e) => updateVerse(verse.id, "content", e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>
            ))}
          </div>

          {/* Preview Card */}
          <div className="bg-game-yellow/20 rounded-3xl p-6 border-2 border-game-yellow/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-game-yellow rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Preview Tip</h4>
                <p className="text-sm text-muted-foreground">
                  After saving, you can create games from this song. Each line of lyrics 
                  can be used for fill-in-the-blank, matching, and other games.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/songs"
              className="px-6 py-3 rounded-2xl font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Song
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
