import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageAdapter } from "./types";

const ROOT = path.join(process.cwd(), "public", "uploads");

const ensureDir = (dir: string) => fs.mkdir(dir, { recursive: true });

const isInsideRoot = (target: string): boolean => {
  const resolved = path.resolve(target);
  const root = path.resolve(ROOT);
  return resolved === root || resolved.startsWith(root + path.sep);
};

export const localStorage: StorageAdapter = {
  async saveFile({ userId, buffer, extension }) {
    if (!/^[a-f0-9-]{36}$/i.test(userId)) {
      throw new Error("Invalid userId");
    }
    const dir = path.join(ROOT, userId);
    await ensureDir(dir);

    const id = randomUUID();
    const filename = `${id}.${extension}`;
    const fullPath = path.join(dir, filename);

    if (!isInsideRoot(fullPath)) {
      throw new Error("Refusing to write outside uploads root");
    }

    await fs.writeFile(fullPath, buffer);

    return {
      key: `${userId}/${filename}`,
      url: `/uploads/${userId}/${filename}`,
    };
  },

  async deleteFile(key) {
    const target = path.join(ROOT, key);
    if (!isInsideRoot(target)) return;
    await fs.rm(target, { force: true });
  },
};
