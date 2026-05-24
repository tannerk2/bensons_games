"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Image as ImageIcon, Type, Upload, X } from "lucide-react";
import type {
  GameSettings,
  MemoryMatchPair,
  MemoryMatchSettings,
  Song,
} from "@/lib/types";

const PAIR_OPTIONS = [4, 6, 8, 10, 12];
const COLOR_OPTIONS = [
  "#4A90D9", // blue
  "#FF7B54", // coral
  "#FFD93D", // yellow
  "#6BCB77", // green
  "#9B59B6", // purple
  "#E91E63", // pink
];

const newPairId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export interface ConfigureMemoryMatchProps {
  songs: Song[];
  settings: MemoryMatchSettings;
  onChange: (s: GameSettings) => void;
}

export function ConfigureMemoryMatch({
  settings,
  onChange,
}: ConfigureMemoryMatchProps) {
  // Local mutable copy of settings for incremental edits.
  const update = (patch: Partial<MemoryMatchSettings>) =>
    onChange({ ...settings, ...patch });

  // Ensure pairs array length matches pairCount when contentType requires custom pairs.
  const pairs = settings.pairs ?? [];
  useEffect(() => {
    if (settings.contentType !== "image-text") return;
    if (pairs.length === settings.pairCount) return;
    const next: MemoryMatchPair[] = [];
    for (let i = 0; i < settings.pairCount; i++) {
      next.push(
        pairs[i] ?? {
          id: newPairId(),
          type: "text" as const,
          text: "",
        }
      );
    }
    update({ pairs: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.pairCount, settings.contentType]);

  const updatePair = (idx: number, patch: Partial<MemoryMatchPair>) => {
    const next = [...pairs];
    next[idx] = { ...next[idx], ...patch };
    update({ pairs: next });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Number of Pairs</label>
        <select
          value={settings.pairCount}
          onChange={(e) => update({ pairCount: Number(e.target.value) })}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          {PAIR_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} pairs ({n * 2} cards)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Content</label>
        <select
          value={settings.contentType}
          onChange={(e) =>
            update({
              contentType: e.target.value as MemoryMatchSettings["contentType"],
            })
          }
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card outline-none focus:border-primary text-base"
        >
          <option value="lyric-lyric">Match lyrics from songs</option>
          <option value="song-verse">Match song titles to a verse</option>
          <option value="image-text">Custom (images and text)</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          {settings.contentType === "lyric-lyric" &&
            "Pairs are auto-generated from your selected songs."}
          {settings.contentType === "song-verse" &&
            "Pairs match song titles to one of their verses."}
          {settings.contentType === "image-text" &&
            "Define each pair below — text or upload an image."}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Theme color</label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => update({ themeColor: c })}
              aria-label={`Theme color ${c}`}
              className={`w-10 h-10 rounded-xl shadow-soft transition ${
                settings.themeColor === c
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : ""
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {settings.contentType === "image-text" && (
        <div>
          <label className="block text-sm font-semibold mb-2">Pairs</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pairs.slice(0, settings.pairCount).map((pair, idx) => (
              <PairEditor
                key={pair.id}
                index={idx}
                pair={pair}
                onChange={(patch) => updatePair(idx, patch)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────── PairEditor ────────────────────────────

interface PairEditorProps {
  index: number;
  pair: MemoryMatchPair;
  onChange: (patch: Partial<MemoryMatchPair>) => void;
}

function PairEditor({ index, pair, onChange }: PairEditorProps) {
  return (
    <div className="bg-muted rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-muted-foreground">
          Pair {index + 1}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              onChange({ type: "text", url: undefined, position: undefined })
            }
            className={`p-1.5 rounded-lg ${
              pair.type === "text"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
            title="Text"
          >
            <Type className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ type: "image", text: undefined })}
            className={`p-1.5 rounded-lg ${
              pair.type === "image"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
            title="Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {pair.type === "text" ? (
        <input
          value={pair.text ?? ""}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Card text…"
          className="w-full px-3 py-2 rounded-lg bg-card border-2 border-border outline-none focus:border-primary text-sm"
        />
      ) : pair.url ? (
        <DraggableImage
          src={pair.url}
          position={pair.position ?? { x: 50, y: 50 }}
          onPositionChange={(position) => onChange({ position })}
          onClear={() =>
            onChange({ url: undefined, position: undefined })
          }
        />
      ) : (
        <ImageUploader onUploaded={(url) => onChange({ url, position: { x: 50, y: 50 } })} />
      )}
    </div>
  );
}

// ──────────────────────────── ImageUploader ────────────────────────────

function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const compress = (file: File, maxEdge = 800, quality = 0.85): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const longest = Math.max(img.width, img.height);
          const scale = longest > maxEdge ? maxEdge / longest : 1;
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas unavailable"));
          ctx.drawImage(img, 0, 0, w, h);
          const isPng = file.type === "image/png";
          canvas.toBlob(
            (blob) => {
              if (!blob) reject(new Error("Failed to encode"));
              else resolve(blob);
            },
            isPng ? "image/png" : "image/jpeg",
            quality
          );
        };
        img.onerror = () => reject(new Error("Failed to decode image"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const tiers: Array<[number, number]> = [
        [800, 0.85],
        [600, 0.8],
        [500, 0.75],
        [400, 0.7],
      ];
      let lastErr: string | null = null;
      for (const [maxEdge, q] of tiers) {
        const blob = await compress(file, maxEdge, q);
        const fd = new FormData();
        fd.append("file", blob, file.name);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        if (res.ok) {
          const data = (await res.json()) as { url: string };
          onUploaded(data.url);
          setPending(false);
          return;
        }
        const body = await res.json().catch(() => ({}));
        lastErr = body?.error ?? `HTTP ${res.status}`;
        if (res.status !== 400 || !/too large/i.test(lastErr ?? "")) break;
      }
      setError(lastErr ?? "Upload failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void upload(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) void upload(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-xl bg-card border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
      <p className="text-xs font-semibold">
        {pending ? "Uploading…" : "Drop or click to upload"}
      </p>
      {error && <p className="text-xs text-game-coral mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFile}
        hidden
      />
    </div>
  );
}

// ──────────────────────────── DraggableImage ────────────────────────────

function DraggableImage({
  src,
  position,
  onPositionChange,
  onClear,
}: {
  src: string;
  position: { x: number; y: number };
  onPositionChange: (p: { x: number; y: number }) => void;
  onClear: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    overflowX: number;
    overflowY: number;
  } | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;

    const scale = Math.max(cw / nw, ch / nh);
    const dispW = nw * scale;
    const dispH = nh * scale;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      overflowX: Math.max(0, dispW - cw),
      overflowY: Math.max(0, dispH - ch),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLImageElement>) => {
    const s = dragRef.current;
    if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const newX =
      s.overflowX > 0
        ? clamp(s.startPosX - (dx / s.overflowX) * 100, 0, 100)
        : s.startPosX;
    const newY =
      s.overflowY > 0
        ? clamp(s.startPosY - (dy / s.overflowY) * 100, 0, 100)
        : s.startPosY;
    onPositionChange({ x: newX, y: newY });
  };

  const endDrag = (e: ReactPointerEvent<HTMLImageElement>) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square rounded-xl overflow-hidden bg-card"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="w-full h-full object-cover cursor-move"
        style={{ objectPosition: `${position.x}% ${position.y}%` }}
      />
      <button
        type="button"
        onClick={onClear}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/70 text-white flex items-center justify-center"
        aria-label="Remove image"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
