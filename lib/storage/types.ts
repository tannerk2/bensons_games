export type SupportedImageType = "image/png" | "image/jpeg" | "image/webp";
export type SupportedExtension = "png" | "jpg" | "webp";

export interface SaveFileInput {
  userId: string;
  buffer: Buffer;
  contentType: SupportedImageType;
  extension: SupportedExtension;
}

export interface SaveFileResult {
  /** Opaque storage key (e.g. relative path or S3 object key). */
  key: string;
  /** Public URL where the saved file can be served. */
  url: string;
}

export interface StorageAdapter {
  saveFile(input: SaveFileInput): Promise<SaveFileResult>;
  /** Best-effort delete; never throws on missing files. */
  deleteFile(key: string): Promise<void>;
}
