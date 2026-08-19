import "server-only";
import { getDb } from "@/lib/data/db";

export type Interest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
};

type InterestRow = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
};

function rowToInterest(row: InterestRow): Interest {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    createdAt: row.created_at,
  };
}

export async function hasSentInterest(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  const row = getDb()
    .prepare("SELECT 1 FROM interests WHERE from_user_id = ? AND to_user_id = ?")
    .get(fromUserId, toUserId);
  return row !== undefined;
}

/** User ids this member has expressed interest in. */
export async function getSentInterestUserIds(userId: string): Promise<string[]> {
  const rows = getDb()
    .prepare(
      "SELECT to_user_id FROM interests WHERE from_user_id = ? ORDER BY created_at DESC"
    )
    .all(userId) as { to_user_id: string }[];
  return rows.map((r) => r.to_user_id);
}

/** User ids who have expressed interest in this member. */
export async function getReceivedInterestUserIds(userId: string): Promise<string[]> {
  const rows = getDb()
    .prepare(
      "SELECT from_user_id FROM interests WHERE to_user_id = ? ORDER BY created_at DESC"
    )
    .all(userId) as { from_user_id: string }[];
  return rows.map((r) => r.from_user_id);
}

/** User ids where interest goes both ways — a real match. */
export async function getMutualMatchUserIds(userId: string): Promise<string[]> {
  // Received interests whose sender this member has also sent one to —
  // a self-join on the pair, newest reciprocation first.
  const rows = getDb()
    .prepare(
      `SELECT r.from_user_id
       FROM interests r
       JOIN interests s ON s.from_user_id = r.to_user_id
                       AND s.to_user_id = r.from_user_id
       WHERE r.to_user_id = ?
       ORDER BY r.created_at DESC`
    )
    .all(userId) as { from_user_id: string }[];
  return rows.map((r) => r.from_user_id);
}

export async function toggleInterest(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  // Guard at the data layer too: nobody can express interest in themselves.
  if (fromUserId === toUserId) return false;

  const db = getDb();
  const removed = db
    .prepare("DELETE FROM interests WHERE from_user_id = ? AND to_user_id = ?")
    .run(fromUserId, toUserId);
  if (removed.changes > 0) return false;

  db.prepare(
    "INSERT INTO interests (id, from_user_id, to_user_id, created_at) VALUES (?, ?, ?, ?)"
  ).run(crypto.randomUUID(), fromUserId, toUserId, new Date().toISOString());
  return true;
}

export async function getAllInterests(): Promise<Interest[]> {
  const rows = getDb()
    .prepare("SELECT * FROM interests ORDER BY created_at DESC")
    .all() as InterestRow[];
  return rows.map(rowToInterest);
}

export type MutualPair = {
  userIdA: string;
  userIdB: string;
  /** When the second of the two interests landed — the moment it became mutual. */
  matchedAt: string;
};

/**
 * Every pair where both members expressed interest in each other.
 * Pure function over already-loaded interests, for the admin console.
 */
export function findMutualPairs(interests: Interest[]): MutualPair[] {
  const sent = new Set(interests.map((i) => `${i.fromUserId}->${i.toUserId}`));
  const pairs: MutualPair[] = [];
  const seen = new Set<string>();

  for (const i of interests) {
    if (!sent.has(`${i.toUserId}->${i.fromUserId}`)) continue;

    const key = [i.fromUserId, i.toUserId].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    const reciprocal = interests.find(
      (r) => r.fromUserId === i.toUserId && r.toUserId === i.fromUserId
    )!;
    pairs.push({
      userIdA: i.fromUserId,
      userIdB: i.toUserId,
      matchedAt:
        i.createdAt > reciprocal.createdAt ? i.createdAt : reciprocal.createdAt,
    });
  }

  return pairs.sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}
