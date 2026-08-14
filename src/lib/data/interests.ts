import "server-only";
import { readStore, writeStore } from "@/lib/data/store";

export type Interest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
};

// Seeded activity so both the member and admin views demo meaningfully.
// Includes two mutual pairs (Sarbjeet<->Simran, Vikram<->Anjali) plus
// several one-directional interests.
const SEED_INTERESTS: Interest[] = [
  {
    id: "seed-1",
    fromUserId: "u-sarbjeet",
    toUserId: "u-simran",
    createdAt: new Date(2026, 0, 7, 11, 20).toISOString(),
  },
  {
    id: "seed-2",
    fromUserId: "u-simran",
    toUserId: "u-sarbjeet",
    createdAt: new Date(2026, 0, 9, 16, 45).toISOString(),
  },
  {
    id: "seed-3",
    fromUserId: "u-priya",
    toUserId: "u-aman",
    createdAt: new Date(2026, 0, 11, 18, 40).toISOString(),
  },
  {
    id: "seed-4",
    fromUserId: "u-gurpreet",
    toUserId: "u-priya",
    createdAt: new Date(2026, 0, 13, 10, 5).toISOString(),
  },
  {
    id: "seed-5",
    fromUserId: "u-vikram",
    toUserId: "u-anjali",
    createdAt: new Date(2026, 0, 16, 9, 5).toISOString(),
  },
  {
    id: "seed-6",
    fromUserId: "u-anjali",
    toUserId: "u-vikram",
    createdAt: new Date(2026, 0, 17, 20, 55).toISOString(),
  },
  {
    id: "seed-7",
    fromUserId: "u-neha",
    toUserId: "u-rahul",
    createdAt: new Date(2026, 0, 19, 14, 30).toISOString(),
  },
  {
    id: "seed-8",
    fromUserId: "u-rahul",
    toUserId: "u-simran",
    createdAt: new Date(2026, 0, 20, 12, 15).toISOString(),
  },
];

function loadInterests(): Interest[] {
  return readStore("interests", SEED_INTERESTS);
}

export async function hasSentInterest(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  return loadInterests().some(
    (i) => i.fromUserId === fromUserId && i.toUserId === toUserId
  );
}

/** User ids this member has expressed interest in. */
export async function getSentInterestUserIds(userId: string): Promise<string[]> {
  return loadInterests()
    .filter((i) => i.fromUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => i.toUserId);
}

/** User ids who have expressed interest in this member. */
export async function getReceivedInterestUserIds(userId: string): Promise<string[]> {
  return loadInterests()
    .filter((i) => i.toUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => i.fromUserId);
}

/** User ids where interest goes both ways — a real match. */
export async function getMutualMatchUserIds(userId: string): Promise<string[]> {
  const interests = loadInterests();
  const sentTo = new Set(
    interests.filter((i) => i.fromUserId === userId).map((i) => i.toUserId)
  );
  return interests
    .filter((i) => i.toUserId === userId && sentTo.has(i.fromUserId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => i.fromUserId);
}

export async function toggleInterest(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  // Guard at the data layer too: nobody can express interest in themselves.
  if (fromUserId === toUserId) return false;

  const interests = loadInterests();
  const existingIndex = interests.findIndex(
    (i) => i.fromUserId === fromUserId && i.toUserId === toUserId
  );

  if (existingIndex >= 0) {
    interests.splice(existingIndex, 1);
    writeStore("interests", interests);
    return false;
  }

  interests.push({
    id: crypto.randomUUID(),
    fromUserId,
    toUserId,
    createdAt: new Date().toISOString(),
  });
  writeStore("interests", interests);
  return true;
}

export async function getAllInterests(): Promise<Interest[]> {
  return [...loadInterests()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
