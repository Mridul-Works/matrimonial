import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { SEED_USERS, SEED_PROFILES, SEED_INTERESTS } from "./seed-data";
import type { AppUser } from "./users";
import type { MatrimonialProfile } from "./profiles";
import type { Interest } from "./interests";

// SQLite via Node's built-in node:sqlite — a real, durable database with
// zero dependencies. The file lives in <project>/data/ (gitignored), so it
// survives reboots and disk cleanups, unlike the old JSON store in the OS
// temp dir. WAL mode lets the dev server's separate compilation layers
// (RSC / SSR / Server Actions) read and write concurrently.
//
// Note for deployment: this needs a host with a persistent writable disk
// (a VPS, or a laptop acting as server). Serverless platforms like Vercel
// have no durable disk — moving there means swapping this connection for
// a hosted database (Postgres/Turso); the modules' queries carry over.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "matrimonial.db");

// Where the retired JSON store kept its files — read once to migrate any
// real accounts registered before the database existed.
const LEGACY_JSON_DIR = path.join(os.tmpdir(), "sain-smajh-matrimonial-data");

// One connection per Node process, held on globalThis so the dev server's
// compilation layers and hot reloads share it instead of piling up handles.
const globalForDb = globalThis as typeof globalThis & {
  __matrimonialDb?: DatabaseSync;
};

export function getDb(): DatabaseSync {
  if (globalForDb.__matrimonialDb) return globalForDb.__matrimonialDb;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  createTables(db);
  seedIfEmpty(db);

  globalForDb.__matrimonialDb = db;
  return db;
}

function createTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      username          TEXT NOT NULL UNIQUE,
      password_hash     TEXT NOT NULL,
      role              TEXT NOT NULL CHECK (role IN ('admin', 'member')),
      phone             TEXT,
      phone_verified    INTEGER,
      phone_verified_at TEXT,
      call_note         TEXT,
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id                 TEXT PRIMARY KEY REFERENCES users(id),
      code_no            TEXT NOT NULL,
      name               TEXT NOT NULL,
      gender             TEXT NOT NULL CHECK (gender IN ('male', 'female')),
      dob                TEXT NOT NULL,
      height_label       TEXT NOT NULL,
      city               TEXT NOT NULL,
      education          TEXT NOT NULL, -- JSON array of strings
      profession         TEXT NOT NULL,
      work_experience    TEXT NOT NULL,
      family             TEXT NOT NULL, -- JSON array of {label, value}
      partner_preference TEXT NOT NULL,
      photo_url          TEXT,
      created_at         TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interests (
      id           TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL REFERENCES users(id),
      to_user_id   TEXT NOT NULL REFERENCES users(id),
      created_at   TEXT NOT NULL,
      UNIQUE (from_user_id, to_user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_interests_from ON interests(from_user_id);
    CREATE INDEX IF NOT EXISTS idx_interests_to   ON interests(to_user_id);
  `);
}

/**
 * On the very first open: prefer migrating the legacy JSON store (it holds
 * whatever was registered while the app ran on files — real accounts, phone
 * numbers, call notes); fall back to the demo seed when there's nothing to
 * migrate. Runs inside a transaction so a half-seeded database can't exist.
 */
function seedIfEmpty(db: DatabaseSync): void {
  const row = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (row.n > 0) return;

  const users = readLegacyJson<AppUser>("users") ?? SEED_USERS;
  const profiles = readLegacyJson<MatrimonialProfile>("profiles") ?? SEED_PROFILES;
  const interests = readLegacyJson<Interest>("interests") ?? SEED_INTERESTS;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, username, password_hash, role, phone,
                       phone_verified, phone_verified_at, call_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, code_no, name, gender, dob, height_label, city,
                          education, profession, work_experience, family,
                          partner_preference, photo_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertInterest = db.prepare(`
    INSERT INTO interests (id, from_user_id, to_user_id, created_at)
    VALUES (?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    for (const u of users) {
      insertUser.run(
        u.id,
        u.name,
        u.username,
        u.passwordHash,
        u.role,
        u.phone ?? null,
        u.phone === undefined ? null : u.phoneVerified ? 1 : 0,
        u.phoneVerifiedAt ?? null,
        u.callNote ?? null,
        u.createdAt
      );
    }
    for (const p of profiles) {
      insertProfile.run(
        p.id,
        p.codeNo,
        p.name,
        p.gender,
        p.dob,
        p.heightLabel,
        p.city,
        JSON.stringify(p.education),
        p.profession,
        p.workExperience,
        JSON.stringify(p.family),
        p.partnerPreference,
        p.photoUrl ?? null,
        p.createdAt
      );
    }
    for (const i of interests) {
      insertInterest.run(i.id, i.fromUserId, i.toUserId, i.createdAt);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

function readLegacyJson<T>(name: string): T[] | undefined {
  try {
    const file = path.join(LEGACY_JSON_DIR, `${name}.json`);
    if (!fs.existsSync(file)) return undefined;
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : undefined;
  } catch {
    return undefined;
  }
}
