import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeText(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, "utf8");
}

export function isoNow(): string {
  return new Date().toISOString();
}

export async function listWorkspaceNames(workspaceRoot: string): Promise<string[]> {
  const names: string[] = [];
  let entries: string[] = [];
  try {
    entries = await readdir(workspaceRoot, { withFileTypes: false });
  } catch {
    return names;
  }

  for (const entry of entries) {
    const full = path.join(workspaceRoot, entry);
    try {
      const s = await stat(full);
      if (s.isDirectory()) {
        names.push(entry);
      }
    } catch {
      // ignore unreadable entries
    }
  }

  return names.sort((a, b) => a.localeCompare(b));
}
