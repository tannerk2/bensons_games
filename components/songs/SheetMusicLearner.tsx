"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Shuffle,
  Upload,
  X,
} from "lucide-react";
import { createSongAction } from "@/app/songs/actions";
import type { SongVerse } from "@/lib/types";

const API_KEY_STORAGE = "sheet-music-api-key";

const PROMPT = `I own this sheet music and need help extracting the lyrics for personal memorization practice. This is for educational use only - I'm a music student/teacher practicing this piece.

Please extract ONLY the sung lyrics/words from this sheet music image.
IGNORE: musical notation, chord symbols, tabs, tempo markings, dynamics, instructions, page numbers.

Return as JSON: {"verses":[{"title":"Verse 1","lines":["line one","line two"]},{"title":"Chorus","lines":["chorus line"]}]}
If no lyrics found: {"verses":[],"error":"No lyrics found"}
Return ONLY the JSON.`;

interface ParsedResult {
  verses: { title?: string; lines: string[] }[];
  error?: string;
}

export function SheetMusicLearner() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");

  const [songTitle, setSongTitle] = useState("");
  const [verses, setVerses] = useState<SongVerse[]>([]);
  const [hiddenLineKeys, setHiddenLineKeys] = useState<Set<string>>(new Set());

  const [savePending, startSave] = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE);
    if (saved) {
      setApiKey(saved);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const persistApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setShowApiKeyInput(false);
    setApiKeyDraft("");
  };

  // ───── PDF / image → base64 conversion ─────

  const pdfPageToBase64 = async (
    // Imported lazily; typed loosely to avoid a top-level pdfjs-dist import.
    page: import("pdfjs-dist").PDFPageProxy
  ): Promise<string> => {
    const scale = 2;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    return canvas.toDataURL("image/png").split(",")[1];
  };

  const imageToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  // ───── Anthropic API call ─────

  const extractLyrics = async (base64Images: string[]): Promise<ParsedResult> => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              ...base64Images.map((b) => ({
                type: "image",
                source: { type: "base64", media_type: "image/png", data: b },
              })),
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body?.error?.message ?? `API error: ${res.status}`;
      throw new Error(message);
    }

    const json = await res.json();
    const text: string = json.content?.[0]?.text ?? "";
    try {
      return JSON.parse(text) as ParsedResult;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as ParsedResult;
        } catch {
          /* fall through */
        }
      }
      throw new Error(
        "Failed to parse AI response. The AI may have refused or returned an unexpected format."
      );
    }
  };

  // ───── Drop-zone handlers ─────

  const processFile = async (file: File) => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setProgressText("Starting…");
    setError("");
    setVerses([]);
    setHiddenLineKeys(new Set());

    try {
      const images: string[] = [];

      if (file.type === "application/pdf") {
        setProgressText("Loading PDF…");
        const pdfjs = await import("pdfjs-dist");
        // Bundle the worker as a static asset; supported by both Next.js
        // turbopack and webpack.
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          setProgressText(`Converting page ${i}/${pdf.numPages}…`);
          setProgress((i / pdf.numPages) * 30);
          images.push(await pdfPageToBase64(await pdf.getPage(i)));
        }
      } else if (file.type.startsWith("image/")) {
        setProgressText("Loading image…");
        setProgress(30);
        images.push(await imageToBase64(file));
      } else {
        throw new Error("Please upload a PDF or image file.");
      }

      setProgress(40);
      setProgressText("Analyzing with Claude…");
      const result = await extractLyrics(images);
      if (!result.verses?.length) {
        throw new Error(result.error || "No lyrics found");
      }
      setVerses(
        result.verses.map((v) => ({
          title: v.title,
          lines: v.lines.filter((l) => l.trim().length > 0),
        }))
      );
      setProgress(100);
      setProgressText("Done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProgressText("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  // ───── Practice mode (toggle hide) ─────

  const lineKey = (vIdx: number, lIdx: number) => `${vIdx}.${lIdx}`;

  const toggleLine = (vIdx: number, lIdx: number) => {
    const k = lineKey(vIdx, lIdx);
    setHiddenLineKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const hideRandomLines = () => {
    if (!verses.length) return;
    const allKeys: string[] = [];
    verses.forEach((v, vi) =>
      v.lines.forEach((_, li) => allKeys.push(lineKey(vi, li)))
    );
    const visible = allKeys.filter((k) => !hiddenLineKeys.has(k));
    if (visible.length === 0) return;
    const target = Math.max(1, Math.floor(visible.length * 0.3));
    const shuffled = [...visible].sort(() => Math.random() - 0.5).slice(0, target);
    setHiddenLineKeys((prev) => new Set([...prev, ...shuffled]));
  };

  const showAllLines = () => setHiddenLineKeys(new Set());

  // ───── Save ─────

  const handleSave = () => {
    if (!songTitle.trim()) {
      setError("Enter a song title before saving.");
      return;
    }
    if (!verses.some((v) => v.lines.length > 0)) {
      setError("No lyrics to save.");
      return;
    }
    setError("");

    const fd = new FormData();
    fd.set("title", songTitle.trim());
    fd.set(
      "verses",
      JSON.stringify(
        verses.map((v) => ({ title: v.title, lines: v.lines }))
      )
    );

    startSave(async () => {
      try {
        const result = await createSongAction(null, fd);
        if (result && !result.ok) setError(result.error);
      } catch (err) {
        if (err instanceof Error && /NEXT_REDIRECT/.test(err.message ?? "")) return;
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  // ───── Render ─────

  return (
    <div className="flex flex-col gap-6">
      {/* Disclaimer */}
      <div className="bg-game-yellow/15 border-2 border-game-yellow/40 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-game-yellow flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-semibold mb-1">Before you upload</p>
          <p className="text-muted-foreground leading-relaxed">
            Make sure you own the rights to the sheet music or have permission
            to use it. Pages are sent to Anthropic&apos;s Claude API for lyric
            extraction. Your API key is stored only in this browser&apos;s local
            storage.
          </p>
        </div>
      </div>

      {/* API key */}
      {showApiKeyInput && (
        <div className="bg-card rounded-3xl shadow-soft p-6">
          <div className="flex items-center gap-3 mb-3">
            <KeyRound className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-extrabold">Claude API key required</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Lyric extraction uses Anthropic&apos;s Claude API. Paste your key
            below; it stays in your browser only.
          </p>
          <input
            type="password"
            placeholder="sk-ant-…"
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && apiKeyDraft) persistApiKey(apiKeyDraft);
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-border outline-none focus:border-primary text-base mb-3"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!apiKeyDraft}
              onClick={() => persistApiKey(apiKeyDraft)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-soft disabled:opacity-50"
            >
              Save key
            </button>
            <a
              href="https://console.anthropic.com/account/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-semibold hover:underline"
            >
              Get an API key →
            </a>
          </div>
        </div>
      )}

      {/* Upload zone */}
      {!showApiKeyInput && verses.length === 0 && !isProcessing && !error && (
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full bg-card rounded-3xl border-4 border-dashed border-border p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-extrabold mb-1">
              Drop a PDF or image here
            </p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              hidden
            />
          </div>
          <button
            type="button"
            onClick={() => setShowApiKeyInput(true)}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Change API key
          </button>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="bg-card rounded-3xl shadow-soft p-8 text-center">
          <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{progressText}</p>
        </div>
      )}

      {/* Error */}
      {error && !isProcessing && (
        <div className="bg-game-coral/10 border-2 border-game-coral/30 rounded-3xl p-6 text-center">
          <p className="text-game-coral font-semibold mb-3">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError("");
              setVerses([]);
            }}
            className="px-4 py-2 rounded-xl bg-card border-2 border-border font-bold text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Result + practice mode */}
      {verses.length > 0 && !isProcessing && (
        <div className="bg-card rounded-3xl shadow-soft p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-5 pb-5 border-b border-border">
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Enter song title…"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-border outline-none focus:border-primary text-lg font-bold"
            />
            <button
              type="button"
              disabled={savePending}
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-game-green text-white font-bold shadow-soft disabled:opacity-50"
            >
              {savePending ? "Saving…" : "Save Song"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <button
              type="button"
              onClick={hideRandomLines}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border-2 border-border font-semibold text-sm"
            >
              <Shuffle className="w-4 h-4" /> Hide random lines
            </button>
            <button
              type="button"
              onClick={showAllLines}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border-2 border-border font-semibold text-sm"
            >
              <Eye className="w-4 h-4" /> Show all
            </button>
            <button
              type="button"
              onClick={() => router.push("/songs/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border-2 border-border font-semibold text-sm ml-auto"
            >
              Switch to manual editor
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Tap any line to hide or reveal it for memorization practice.
          </p>

          <div className="flex flex-col gap-5">
            {verses.map((verse, vi) => (
              <div key={vi} className="bg-muted rounded-2xl p-4 sm:p-5">
                {verse.title && (
                  <h3 className="text-sm font-bold text-primary mb-3">
                    {verse.title}
                  </h3>
                )}
                <div className="flex flex-col gap-2">
                  {verse.lines.map((line, li) => {
                    const k = lineKey(vi, li);
                    const hidden = hiddenLineKeys.has(k);
                    return (
                      <button
                        key={li}
                        type="button"
                        onClick={() => toggleLine(vi, li)}
                        className={`text-left px-3 py-2 rounded-lg text-base transition-colors ${
                          hidden
                            ? "bg-primary/10 text-transparent border-b-2 border-primary"
                            : "hover:bg-card"
                        }`}
                      >
                        {hidden ? <EyeOff className="w-4 h-4 text-primary inline" /> : line}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
