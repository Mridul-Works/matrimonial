import "server-only";
import fs from "node:fs";
import path from "node:path";

// Next.js's dev server can evaluate a module more than once across its
// separate server compilation layers (RSC / SSR / Server Actions), so a
// plain in-memory array isn't guaranteed to be the same instance a Server
// Action mutates and a page later reads. Backing the "database" with a JSON
// file on disk sidesteps that: every layer reads/writes the same file.
const DATA_DIR = path.join(process.cwd(), ".data");

function filePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readStore<T>(name: string, seed: T): T {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = filePath(name);

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(seed, null, 2));
    return seed;
  }

  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return seed;
  }
}

export function writeStore<T>(name: string, data: T): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}
