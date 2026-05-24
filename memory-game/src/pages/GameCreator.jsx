import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { saveGame, getGame, getGridLayout } from '../utils/storage'
import './GameCreator.css'

const PAIR_OPTIONS = [4, 6, 8, 10, 12]

const getImageDimensions = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = () => resolve({ width: 1, height: 1 })
    img.src = url
  })
}

// Downscale a data URL to target dimensions and re-encode as JPEG.
// Transparent PNGs keep PNG format to preserve alpha.
const compressImageDataUrl = (dataUrl, maxEdge = 800, quality = 0.85) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      const longest = Math.max(width, height)
      const scale = longest > maxEdge ? maxEdge / longest : 1
      const w = Math.max(1, Math.round(width * scale))
      const h = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)

      const isPng = dataUrl.startsWith('data:image/png')
      const out = isPng
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', quality)
      resolve(out)
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// Compress all image pairs in parallel with given settings
const compressPairs = async (pairs, maxEdge, quality) => {
  return Promise.all(pairs.map(async (p) => {
    if (p.type !== 'image' || !p.url) return p
    // Only compress data URLs (uploaded files), not external http URLs
    if (!p.url.startsWith('data:')) return p
    const url = await compressImageDataUrl(p.url, maxEdge, quality)
    return { ...p, url }
  }))
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

// Draggable image preview that adjusts object-position based on pointer drag.
// The image is displayed with object-fit: cover in a square (container aspect),
// so we compute the overflow on each axis to convert pixel drag into % change.
function DraggableImage({ src, position, onPositionChange, onRemove, alt }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const dragStateRef = useRef(null)
  const pos = position || { x: 50, y: 50 }

  const handlePointerDown = (e) => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return
    const cw = container.clientWidth
    const ch = container.clientHeight
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    if (!nw || !nh) return

    // Compute displayed image size with object-fit: cover
    const scale = Math.max(cw / nw, ch / nh)
    const dispW = nw * scale
    const dispH = nh * scale
    const overflowX = Math.max(0, dispW - cw)
    const overflowY = Math.max(0, dispH - ch)

    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      overflowX,
      overflowY,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    const s = dragStateRef.current
    if (!s) return
    const dx = e.clientX - s.startX
    const dy = e.clientY - s.startY
    // Moving the pointer right should shift the image right, which means
    // revealing more of the left side → decrease object-position X percent.
    const newX = s.overflowX > 0 ? clamp(s.startPosX - (dx / s.overflowX) * 100, 0, 100) : s.startPosX
    const newY = s.overflowY > 0 ? clamp(s.startPosY - (dy / s.overflowY) * 100, 0, 100) : s.startPosY
    onPositionChange({ x: newX, y: newY })
  }

  const endDrag = (e) => {
    dragStateRef.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
  }

  return (
    <div className="image-preview" ref={containerRef}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      <div className="drag-hint">Drag to reposition</div>
      <button className="remove-image" onClick={onRemove}>×</button>
    </div>
  )
}

function GameCreator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [gameName, setGameName] = useState('')
  const [pairCount, setPairCount] = useState(6)
  const [themeColor, setThemeColor] = useState('#667eea')
  const [images, setImages] = useState([])
  const [aspectRatio, setAspectRatio] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  useEffect(() => {
    if (id) {
      const game = getGame(id)
      if (game) {
        setGameName(game.name)
        setPairCount(game.pairCount)
        setThemeColor(game.themeColor || '#667eea')
        // Support both old 'images' format and new 'pairs' format
        const pairs = game.pairs || game.images?.map(img => ({ ...img, type: 'image' })) || []
        setImages(pairs)
        setAspectRatio(game.aspectRatio || 1)
      }
    }
  }, [id])

  useEffect(() => {
    setImages(prev => {
      const newImages = [...prev]
      while (newImages.length < pairCount) {
        newImages.push({ id: uuidv4(), type: 'image', url: '', text: '', position: { x: 50, y: 50 } })
      }
      return newImages.slice(0, pairCount)
    })
  }, [pairCount])

  const updateAspectRatio = async (imageList) => {
    const validImages = imageList.filter(img => img.type === 'image' && img.url)
    if (validImages.length === 0) {
      setAspectRatio(1)
      return
    }
    const dimensions = await Promise.all(validImages.map(img => getImageDimensions(img.url)))
    const avgWidth = dimensions.reduce((sum, d) => sum + d.width, 0) / dimensions.length
    const avgHeight = dimensions.reduce((sum, d) => sum + d.height, 0) / dimensions.length
    setAspectRatio(avgWidth / avgHeight)
  }

  const handleTypeChange = (index, type) => {
    const updated = [...images]
    updated[index] = { ...updated[index], type, url: '', text: '', position: { x: 50, y: 50 } }
    setImages(updated)
    updateAspectRatio(updated)
  }

  const handleTextChange = (index, text) => {
    const updated = [...images]
    updated[index] = { ...updated[index], text }
    setImages(updated)
  }

  const handleImageUrlChange = async (index, url) => {
    const updated = [...images]
    updated[index] = { ...updated[index], url, position: { x: 50, y: 50 } }
    setImages(updated)
    await updateAspectRatio(updated)
  }

  const handleFileUpload = (index, file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const compressed = await compressImageDataUrl(e.target.result, 800, 0.85)
      const updated = [...images]
      updated[index] = { ...updated[index], url: compressed, position: { x: 50, y: 50 } }
      setImages(updated)
      await updateAspectRatio(updated)
    }
    reader.readAsDataURL(file)
  }

  const handlePositionChange = (index, position) => {
    setImages(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], position }
      return updated
    })
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    setDragOverIndex(null)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(index, file)
    }
  }

  const handleClear = (index) => {
    const updated = [...images]
    updated[index] = { ...updated[index], url: '', text: '' }
    setImages(updated)
    updateAspectRatio(updated)
  }

  const isPairComplete = (img) => {
    return img.type === 'text' ? img.text.trim() : img.url
  }

  const isValid = gameName.trim() && images.every(isPairComplete)

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!isValid || isSaving) return
    setIsSaving(true)

    // Try progressively smaller image sizes until it fits in storage.
    // Each tier is (maxEdge, quality).
    const tiers = [
      [800, 0.85],
      [600, 0.8],
      [500, 0.75],
      [400, 0.7],
      [320, 0.65],
      [256, 0.6],
    ]

    let lastErr = null
    for (const [maxEdge, quality] of tiers) {
      try {
        const compressedPairs = await compressPairs(images, maxEdge, quality)
        const game = {
          id: id || uuidv4(),
          name: gameName.trim(),
          pairCount,
          themeColor,
          aspectRatio,
          pairs: compressedPairs.map(img => ({
            id: img.id,
            type: img.type || 'image',
            url: img.url || '',
            text: img.text || '',
            position: img.position || { x: 50, y: 50 }
          })),
        }
        saveGame(game)
        setIsSaving(false)
        navigate('/library')
        return
      } catch (err) {
        lastErr = err
        const isQuota = err && (err.name === 'QuotaExceededError' || /quota/i.test(err.message || ''))
        if (!isQuota) break // non-quota error, stop retrying
        // else continue to next smaller tier
      }
    }

    setIsSaving(false)
    console.error('Failed to save game:', lastErr)
    const isQuota = lastErr && (lastErr.name === 'QuotaExceededError' || /quota/i.test(lastErr.message || ''))
    if (isQuota) {
      alert('Could not save: images are too large even after compression. Try using fewer pairs or reducing the number of saved games.')
    } else {
      alert(`Could not save game: ${lastErr?.message || lastErr}`)
    }
  }

  const layout = getGridLayout(pairCount)

  return (
    <div className="creator container">
      <Link to="/" className="back-link">← Back to Home</Link>
      <h1 className="page-title">{id ? 'Edit Game' : 'Create New Game'}</h1>

      <div className="card creator-card">
        <div className="creator-form">
          <div className="form-group">
            <label>Game Name</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name..."
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Number of Pairs</label>
              <select
                value={pairCount}
                onChange={(e) => setPairCount(Number(e.target.value))}
                className="form-select"
              >
                {PAIR_OPTIONS.map(n => (
                  <option key={n} value={n}>{n} pairs ({n * 2} cards)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Theme Color</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="form-color"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Card Content ({images.filter(isPairComplete).length}/{pairCount} added)</label>
            <div className="images-grid">
              {images.map((img, index) => (
                <div key={img.id} className="image-slot">
                  <div className="slot-header">
                    <span className="slot-number">Pair {index + 1}</span>
                    <div className="type-toggle">
                      <button
                        className={`type-btn ${img.type === 'image' ? 'active' : ''}`}
                        onClick={() => handleTypeChange(index, 'image')}
                      >🖼️ Image</button>
                      <button
                        className={`type-btn ${img.type === 'text' ? 'active' : ''}`}
                        onClick={() => handleTypeChange(index, 'text')}
                      >📝 Text</button>
                    </div>
                  </div>
                  
                  {img.type === 'text' ? (
                    <div className="text-input-area">
                      <input
                        type="text"
                        placeholder="Enter card text..."
                        value={img.text || ''}
                        onChange={(e) => handleTextChange(index, e.target.value)}
                        className="url-input"
                      />
                      {img.text && (
                        <button 
                          type="button"
                          className="clear-text-btn"
                          onClick={() => handleClear(index)}
                        >Clear</button>
                      )}
                    </div>
                  ) : (
                    img.url ? (
                      <DraggableImage
                        src={img.url}
                        alt={`Pair ${index + 1}`}
                        position={img.position}
                        onPositionChange={(pos) => handlePositionChange(index, pos)}
                        onRemove={() => handleClear(index)}
                      />
                    ) : (
                      <div 
                        className={`image-input-area drop-zone ${dragOverIndex === index ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div className="drop-hint">Drop image here</div>
                        <input
                          type="text"
                          placeholder="Paste image URL..."
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          className="url-input"
                        />
                        <span className="or-divider">or</span>
                        <label className="file-upload-btn">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(index, e.target.files[0])}
                            hidden
                          />
                        </label>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="creator-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowPreview(true)}
            disabled={!isValid}
          >
            Preview Game
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!isValid || isSaving}
          >
            {isSaving ? 'Saving...' : (id ? 'Save Changes' : 'Save Game')}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="preview-modal" onClick={() => setShowPreview(false)}>
          <div className="preview-content" onClick={e => e.stopPropagation()}>
            <h2>Preview: {gameName}</h2>
            <p>Grid: {layout.cols} × {layout.rows} ({pairCount * 2} cards)</p>
            <div
              className="preview-grid"
              style={{
                gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                '--theme-color': themeColor,
                '--card-aspect': aspectRatio
              }}
            >
              {images.concat(images).sort(() => Math.random() - 0.5).map((_, i) => (
                <div key={i} className="preview-card">
                  <div className="preview-card-back" style={{ background: themeColor }}></div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameCreator
