import "server-only";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/data/db";

export type UserRole = "admin" | "member";

export type AppUser = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  // Contact number in +91XXXXXXXXXX form. Deliberately kept on the user
  // record, NOT the profile — profiles are served to every member, so a
  // number stored here can only ever reach admin-facing pages. Optional
  // because the admin account and pre-phone seed data have none.
  phone?: string;
  // Set by the admin after the confirmation call (or immediately for
  // walk-ins, where the number is taken in person).
  phoneVerified?: boolean;
  // When the admin marked the number verified — the paper trail for the
  // 48-hour promise. Cleared if verification is reverted.
  phoneVerifiedAt?: string;
  // Admin's scratch note about the confirmation call, e.g.
  // "didn't pick up, retry Tuesday". Never shown to members.
  callNote?: string;
  createdAt: string;
};

// Every member account owns exactly one profile, keyed by the same id
// (see lib/data/profiles.ts). Admins have no profile — they oversee only.

type UserRow = {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: string;
  phone: string | null;
  phone_verified: number | null;
  phone_verified_at: string | null;
  call_note: string | null;
  created_at: string;
};

function rowToUser(row: UserRow): AppUser {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    phone: row.phone ?? undefined,
    phoneVerified:
      row.phone_verified === null ? undefined : row.phone_verified === 1,
    phoneVerifiedAt: row.phone_verified_at ?? undefined,
    callNote: row.call_note ?? undefined,
    createdAt: row.created_at,
  };
}

export async function findUserByUsername(username: string): Promise<AppUser | undefined> {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)")
    .get(username) as UserRow | undefined;
  return row ? rowToUser(row) : undefined;
}

export async function findUserById(id: string): Promise<AppUser | undefined> {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
  return row ? rowToUser(row) : undefined;
}

export async function findUserByPhone(phone: string): Promise<AppUser | undefined> {
  const row = getDb().prepare("SELECT * FROM users WHERE phone = ?").get(phone) as
    | UserRow
    | undefined;
  return row ? rowToUser(row) : undefined;
}

export async function createUser(input: {
  name: string;
  username: string;
  password: string;
  phone?: string;
  phoneVerified?: boolean;
}): Promise<AppUser> {
  const user: AppUser = {
    id: `u-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name,
    username: input.username,
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: "member",
    phone: input.phone,
    phoneVerified: input.phone ? input.phoneVerified ?? false : undefined,
    phoneVerifiedAt:
      input.phone && input.phoneVerified ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
  };

  getDb()
    .prepare(
      `INSERT INTO users (id, name, username, password_hash, role, phone,
                          phone_verified, phone_verified_at, call_note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      user.id,
      user.name,
      user.username,
      user.passwordHash,
      user.role,
      user.phone ?? null,
      user.phone === undefined ? null : user.phoneVerified ? 1 : 0,
      user.phoneVerifiedAt ?? null,
      null,
      user.createdAt
    );

  return user;
}

export async function setPhoneVerified(
  userId: string,
  verified: boolean
): Promise<AppUser | undefined> {
  const result = getDb()
    .prepare(
      `UPDATE users SET phone_verified = ?, phone_verified_at = ?
       WHERE id = ? AND phone IS NOT NULL`
    )
    .run(verified ? 1 : 0, verified ? new Date().toISOString() : null, userId);
  if (result.changes === 0) return undefined;
  return findUserById(userId);
}

export async function setCallNote(
  userId: string,
  note: string
): Promise<AppUser | undefined> {
  const trimmed = note.trim();
  const result = getDb()
    .prepare("UPDATE users SET call_note = ? WHERE id = ?")
    .run(trimmed || null, userId);
  if (result.changes === 0) return undefined;
  return findUserById(userId);
}

export async function verifyPassword(user: AppUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function getAllUsers(): Promise<AppUser[]> {
  const rows = getDb()
    .prepare("SELECT * FROM users ORDER BY created_at DESC")
    .all() as UserRow[];
  return rows.map(rowToUser);
}
