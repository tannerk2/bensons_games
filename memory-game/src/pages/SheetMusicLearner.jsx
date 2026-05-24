import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { getSong, saveSong } from '../utils/storage'
import './SheetMusicLearner.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
const API_KEY_STORAGE = 'sheet-music-api-key'

function SheetMusicLearner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [songId, setSongId] = useState(id || null)
  const [songTitle, setSongTitle] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [verses, setVerses] = useState([])
  const [hiddenWords, setHiddenWords] = useState(new Set())
  const [error, setError] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [dragItem, setDragItem] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE)
    if (savedKey) setApiKey(savedKey)
    else setShowApiKeyInput(true)
  }, [])

  // Load existing song if editing
  useEffect(() => {
    if (id) {
      const song = getSong(id)
      if (song) {
        setSongId(song.id)
        setSongTitle(song.title)
        setVerses(song.verses)
      }
    }
  }, [id])

  const saveApiKey = (key) => {
    localStorage.setItem(API_KEY_STORAGE, key)
    setApiKey(key)
    setShowApiKeyInput(false)
  }

  const pdfPageToBase64 = async (page) => {
    const scale = 2
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    return canvas.toDataURL('image/png').split(',')[1]
  }

  const extractLyricsWithClaude = async (base64Images) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            ...base64Images.map(b => ({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: b } })),
            { type: 'text', text: `I own this sheet music and need help extracting the lyrics for personal memorization practice. This is for educational use only - I'm a music student/teacher practicing this piece.

Please extract ONLY the sung lyrics/words from this sheet music image.
IGNORE: musical notation, chord symbols, tabs, tempo markings, dynamics, instructions, page numbers.

Return as JSON: {"verses":[{"title":"Verse 1","lines":["line one","line two"]},{"title":"Chorus","lines":["chorus line"]}]}
If no lyrics found: {"verses":[],"error":"No lyrics found"}
Return ONLY the JSON.` }
          ]
        }]
      })
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error?.message || `API error: ${res.status}`)
    const content = (await res.json()).content[0].text
    console.log('Claude response:', content)
    try { return JSON.parse(content) } catch { 
      const m = content.match(/\{[\s\S]*\}/)
      if (m) {
        try { return JSON.parse(m[0]) } catch (e) { console.error('JSON parse error:', e, m[0]) }
      }
      throw new Error('Failed to parse AI response. The AI may have refused or returned unexpected format. Check console for details.')
    }
  }

  const convertToVerseFormat = (r) => {
    if (!r.verses?.length) throw new Error(r.error || 'No lyrics found')
    return r.verses.map((v, vi) => ({
      title: v.title,
      lines: v.lines.map((l, li) => ({
        id: `m-${vi}-${li}`,
        words: l.split(/\s+/).filter(w => w).map((w, wi) => ({ id: `w-${vi}-${li}-${wi}`, text: w }))
      }))
    }))
  }

  const processFile = async (file) => {
    if (!apiKey) { setShowApiKeyInput(true); return }
    setIsProcessing(true); setProgress(0); setProgressText('Starting...'); setVerses([]); setHiddenWords(new Set()); setError('')
    try {
      let imgs = []
      if (file.type === 'application/pdf') {
        setProgressText('Loading PDF...')
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
        for (let i = 1; i <= pdf.numPages; i++) {
          setProgressText(`Converting page ${i}/${pdf.numPages}...`); setProgress((i / pdf.numPages) * 30)
          imgs.push(await pdfPageToBase64(await pdf.getPage(i)))
        }
      } else {
        setProgressText('Loading image...'); setProgress(30)
        imgs.push(await new Promise(r => { const rd = new FileReader(); rd.onload = e => r(e.target.result.split(',')[1]); rd.readAsDataURL(file) }))
      }
      setProgress(40); setProgressText('Analyzing with AI...')
      setVerses(convertToVerseFormat(await extractLyricsWithClaude(imgs)))
      setProgress(100); setProgressText('Done!')
    } catch (e) { setError(e.message); setProgressText('Error') }
    finally { setIsProcessing(false) }
  }

  const handleDrop = useCallback(e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && (f.type === 'application/pdf' || f.type.startsWith('image/'))) processFile(f) }, [apiKey])
  const toggleWord = id => setHiddenWords(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const removeRandomWords = () => {
    if (!verses.length) return
    const ids = verses.flatMap(v => v.lines.flatMap(m => m.words.map(w => w.id))).filter(id => !hiddenWords.has(id))
    if (!ids.length) return
    const rm = [...ids].sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.floor(ids.length * 0.2)))
    setHiddenWords(p => { const n = new Set(p); rm.forEach(id => n.add(id)); return n })
  }
  const showAllWords = () => { if (!verses.length) return; const ids = verses.flatMap(v => v.lines.flatMap(m => m.words.map(w => w.id))); setHiddenWords(p => { const n = new Set(p); ids.forEach(id => n.delete(id)); return n }) }

  // Drag and drop for reorganizing
  const handleLineDragStart = (verseIdx, lineIdx) => {
    setDragItem({ verseIdx, lineIdx })
  }

  const handleLineDragOver = (e) => {
    e.preventDefault()
  }

  const handleLineDrop = (targetVerseIdx, targetLineIdx) => {
    if (!dragItem) return
    const { verseIdx: srcVerseIdx, lineIdx: srcLineIdx } = dragItem
    
    if (srcVerseIdx === targetVerseIdx && srcLineIdx === targetLineIdx) {
      setDragItem(null)
      return
    }

    setVerses(prev => {
      const newVerses = JSON.parse(JSON.stringify(prev))
      const [movedLine] = newVerses[srcVerseIdx].lines.splice(srcLineIdx, 1)
      
      // Adjust target index if moving within same verse and source was before target
      let adjustedTargetIdx = targetLineIdx
      if (srcVerseIdx === targetVerseIdx && srcLineIdx < targetLineIdx) {
        adjustedTargetIdx--
      }
      
      newVerses[targetVerseIdx].lines.splice(adjustedTargetIdx, 0, movedLine)
      return newVerses
    })
    setDragItem(null)
  }

  const handleVerseDragStart = (verseIdx) => {
    setDragItem({ verseIdx, isVerse: true })
  }

  const handleVerseDrop = (targetVerseIdx) => {
    if (!dragItem || !dragItem.isVerse) return
    const { verseIdx: srcVerseIdx } = dragItem
    
    if (srcVerseIdx === targetVerseIdx) {
      setDragItem(null)
      return
    }

    setVerses(prev => {
      const newVerses = [...prev]
      const [movedVerse] = newVerses.splice(srcVerseIdx, 1)
      const adjustedIdx = srcVerseIdx < targetVerseIdx ? targetVerseIdx - 1 : targetVerseIdx
      newVerses.splice(adjustedIdx, 0, movedVerse)
      return newVerses
    })
    setDragItem(null)
  }

  const renameVerse = (verseIdx, newTitle) => {
    setVerses(prev => {
      const newVerses = [...prev]
      newVerses[verseIdx] = { ...newVerses[verseIdx], title: newTitle }
      return newVerses
    })
  }

  const moveLineToVerse = (srcVerseIdx, lineIdx, targetVerseIdx) => {
    setVerses(prev => {
      const newVerses = JSON.parse(JSON.stringify(prev))
      const [movedLine] = newVerses[srcVerseIdx].lines.splice(lineIdx, 1)
      newVerses[targetVerseIdx].lines.push(movedLine)
      // Remove empty verses
      return newVerses.filter(v => v.lines.length > 0)
    })
  }

  const addNewVerse = () => {
    setVerses(prev => [...prev, { title: `Section ${prev.length + 1}`, lines: [] }])
  }

  const addLineToVerse = (verseIdx) => {
    const newId = `m-${verseIdx}-${Date.now()}`
    setVerses(prev => {
      const newVerses = JSON.parse(JSON.stringify(prev))
      newVerses[verseIdx].lines.push({ id: newId, words: [] })
      return newVerses
    })
  }

  const deleteLine = (verseIdx, lineIdx) => {
    setVerses(prev => {
      const newVerses = JSON.parse(JSON.stringify(prev))
      newVerses[verseIdx].lines.splice(lineIdx, 1)
      return newVerses
    })
  }

  const deleteVerse = (verseIdx) => {
    setVerses(prev => prev.filter((_, i) => i !== verseIdx))
  }

  const addWordToLine = (verseIdx, lineIdx, word) => {
    if (!word.trim()) return
    const newId = `w-${verseIdx}-${lineIdx}-${Date.now()}`
    setVerses(prev => {
      const newVerses = JSON.parse(JSON.stringify(prev))
      newVerses[verseIdx].lines[lineIdx].words.push({ id: newId, text: word.trim() })
      return newVerses
    })
  }

  const editWord = (verseIdx, lineIdx, wordIdx, newText) => {
    setVerses(prev => {
      const newVerses = JSON.parse(JSON.stringify(prev))
      newVerses[verseIdx].lines[lineIdx].words[wordIdx].text = newText
      return newVerses
    })
  }

  const deleteWord = (verseIdx, lineIdx, wordIdx) => {
    setVerses(prev => {
      const newVerses = JSON.parse(JSON.stringify(prev))
      newVerses[verseIdx].lines[lineIdx].words.splice(wordIdx, 1)
      return newVerses
    })
  }

  const handleSaveSong = () => {
    if (!songTitle.trim()) {
      alert('Please enter a song title')
      return
    }
    const song = {
      id: songId || uuidv4(),
      title: songTitle.trim(),
      verses
    }
    saveSong(song)
    setSongId(song.id)
    navigate('/song-library')
  }

  const createFromScratch = () => {
    setVerses([{ title: 'Verse 1', lines: [{ id: `m-0-0-${Date.now()}`, words: [] }] }])
    setEditMode(true)
    setSongTitle('')
    setSongId(null)
  }

  return (
    <div className="sheet-music-learner container">
      <Link to="/" className="back-link">← Back to Home</Link>
      <h1 className="page-title">🎵 Sheet Music Learner</h1>
      <p className="page-subtitle">Upload sheet music to practice memorizing lyrics</p>

      {showApiKeyInput && <div className="api-key-section"><div className="api-key-card">
        <h3>🔑 Claude API Key Required</h3>
        <p>This feature uses Claude AI to extract lyrics from sheet music.</p>
        <input type="password" placeholder="Enter your Anthropic API key..." className="api-key-input" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && apiKeyInput) saveApiKey(apiKeyInput) }} />
        <div className="api-key-actions">
          <button className="btn btn-primary" onClick={() => { if (apiKeyInput) saveApiKey(apiKeyInput) }}>Save Key</button>
          <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer" className="api-key-link">Get an API key →</a>
        </div>
      </div></div>}

      {!showApiKeyInput && !verses.length && !isProcessing && !error && <div className="upload-section">
        <div className="upload-zone" onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}>
          <div className="upload-icon">📄</div>
          <p className="upload-text">Drop PDF or image here</p>
          <p className="upload-hint">or click to browse</p>
          <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={e => e.target.files[0] && processFile(e.target.files[0])} hidden />
          <button className="change-api-key" onClick={e => { e.stopPropagation(); setShowApiKeyInput(true) }}>Change API Key</button>
        </div>
        <div className="or-divider"><span>or</span></div>
        <button className="btn btn-secondary create-scratch-btn" onClick={createFromScratch}>
          ✍️ Create from Scratch
        </button>
      </div>}

      {isProcessing && <div className="processing-section"><div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><p className="progress-text">{progressText}</p></div>}

      {error && !isProcessing && <div className="error-section"><p className="error-text">❌ {error}</p><button className="btn btn-secondary" onClick={() => { setError(''); setVerses([]) }}>Try Again</button></div>}

      {verses.length > 0 && !isProcessing && <div className="lyrics-section">
        <div className="song-header">
          <input type="text" value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="Enter song title..." className="song-title-input" />
          <button className="btn btn-primary" onClick={handleSaveSong}>Save Song</button>
        </div>
        <div className="lyrics-controls">
          <button className={`btn ${editMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setEditMode(!editMode)}>
            {editMode ? '✓ Done Editing' : '✏️ Edit Layout'}
          </button>
          <button className="btn btn-secondary" onClick={removeRandomWords}>🎲 Remove Random Words</button>
          <button className="btn btn-secondary" onClick={showAllWords}>�️ Show All Words</button>
          <button className="btn btn-secondary" onClick={() => { setVerses([]); setHiddenWords(new Set()); setEditMode(false); setSongTitle(''); setSongId(null) }}>📤 Upload New</button>
        </div>
        
        {editMode && <div className="edit-hint">Drag lines to reorder. Drag verse headers to reorder sections. Click verse titles to rename.</div>}
        
        <div className="all-verses">
          {verses.map((verse, vi) => (
            <div 
              key={vi} 
              className={`verse-block ${editMode ? 'editable' : ''}`}
              onDragOver={editMode ? handleLineDragOver : undefined}
              onDrop={editMode && dragItem?.isVerse ? () => handleVerseDrop(vi) : undefined}
            >
              {editMode ? (
                <div 
                  className="verse-title-edit"
                  draggable
                  onDragStart={() => handleVerseDragStart(vi)}
                >
                  <span className="drag-handle">⋮⋮</span>
                  <input 
                    type="text" 
                    value={verse.title} 
                    onChange={e => renameVerse(vi, e.target.value)}
                    className="verse-title-input"
                  />
                  <button className="delete-btn" onClick={() => deleteVerse(vi)} title="Delete section">×</button>
                </div>
              ) : (
                <h3 className="verse-title">{verse.title}</h3>
              )}
              <div className="measures">
                {verse.lines.map((m, li) => (
                  <div 
                    key={m.id} 
                    className={`measure-row ${editMode ? 'draggable' : ''} ${dragItem && !dragItem.isVerse && dragItem.verseIdx === vi && dragItem.lineIdx === li ? 'dragging' : ''}`}
                    draggable={editMode}
                    onDragStart={editMode ? () => handleLineDragStart(vi, li) : undefined}
                    onDragOver={editMode ? handleLineDragOver : undefined}
                    onDrop={editMode && !dragItem?.isVerse ? () => handleLineDrop(vi, li) : undefined}
                  >
                    {editMode && <span className="drag-handle">⋮⋮</span>}
                    {m.words.map((w, wi) => (
                      editMode ? (
                        <span key={w.id} className="word-edit-wrapper">
                          <input
                            type="text"
                            value={w.text}
                            onChange={e => editWord(vi, li, wi, e.target.value)}
                            className="word-input"
                            style={{ width: `${Math.max(w.text.length, 2) + 1}ch` }}
                          />
                          <button className="delete-word-btn" onClick={() => deleteWord(vi, li, wi)}>×</button>
                        </span>
                      ) : (
                        <span key={w.id} className={`word ${hiddenWords.has(w.id) ? 'hidden' : ''}`} onClick={() => toggleWord(w.id)}>
                          {hiddenWords.has(w.id) ? '\u00A0'.repeat(w.text.length) : w.text}
                        </span>
                      )
                    ))}
                    {editMode && (
                      <>
                        <input
                          type="text"
                          placeholder="+ word"
                          className="add-word-input"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && e.target.value) {
                              addWordToLine(vi, li, e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <button className="delete-line-btn" onClick={() => deleteLine(vi, li)} title="Delete line">🗑</button>
                      </>
                    )}
                    {editMode && verses.length > 1 && (
                      <select 
                        className="move-to-verse" 
                        value="" 
                        onChange={e => { if (e.target.value) moveLineToVerse(vi, li, parseInt(e.target.value)) }}
                      >
                        <option value="">Move to...</option>
                        {verses.map((v, i) => i !== vi && <option key={i} value={i}>{v.title}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button className="add-line-btn" onClick={() => addLineToVerse(vi)}>+ Add Line</button>
                )}
              </div>
            </div>
          ))}
          {editMode && (
            <button className="btn btn-secondary add-verse-btn" onClick={addNewVerse}>+ Add Section</button>
          )}
        </div>
      </div>}
    </div>
  )
}

export default SheetMusicLearner
