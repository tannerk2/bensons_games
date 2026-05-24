import "server-only";
import { localStorage } from "./local";
import type { StorageAdapter } from "./types";

/**
 * The application's storage adapter. Swap this single line to point at S3,
 * Vercel Blob, or another backend without changing any call sites.
 */
export const storage: StorageAdapter = localStorage;

export type { StorageAdapter, SaveFileInput, SaveFileResult } from "./types";
