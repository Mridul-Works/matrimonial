import "server-only";
import { readStore, writeStore } from "@/lib/data/store";
import type { MatrimonialProfile } from "@/lib/data/profiles";

export type Interest = {
  id: string;
  userId: string;
  profileId: string;
  createdAt: string;
};

// Seeded activity so the admin match-log demos meaningfully out of the box.
const SEED_INTERESTS: Interest[] = [
  {
    id: "seed-int-1",
    userId: "member-ravi",
    profileId: "17-26",
    createdAt: new Date(2026, 0, 7, 11, 20).toISOString(),
  },
  {
    id: "seed-int-2",
    userId: "member-ravi",
    profileId: "61-26",
    createdAt: new Date(2026, 0, 16, 9, 5).toISOString(),
  },
  {
    id: "seed-int-3",
    userId: "member-pooja",
    profileId: "08-26",
    createdAt: new Date(2026, 0, 11, 18, 40).toISOString(),
  },
  {
    id: "seed-int-4",
    userId: "member-harish",
    profileId: "23-26",
    createdAt: new Date(2026, 0, 15, 14, 10).toISOString(),
  },
  {
    id: "seed-int-5",
    userId: "member-pooja",
    profileId: "77-26",
    createdAt: new Date(2026, 0, 17, 20, 55).toISOString(),
  },
];

function loadInterests(): Interest[] {
  return readStore("interests", SEED_INTERESTS);
}

export async function isInterested(userId: string, profileId: string): Promise<boolean> {
  return loadInterests().some((i) => i.userId === userId && i.profileId === profileId);
}

export async function getInterestedProfileIds(userId: string): Promise<string[]> {
  return loadInterests()
    .filter((i) => i.userId === userId)
    .map((i) => i.profileId);
}

export async function toggleInterest(userId: string, profileId: string): Promise<boolean> {
  const interests = loadInterests();
  const existingIndex = interests.findIndex(
    (i) => i.userId === userId && i.profileId === profileId
  );

  if (existingIndex >= 0) {
    interests.splice(existingIndex, 1);
    writeStore("interests", interests);
    return false;
  }

  interests.push({
    id: crypto.randomUUID(),
    userId,
    profileId,
    createdAt: new Date().toISOString(),
  });
  writeStore("interests", interests);
  return true;
}

export async function getAllInterests(): Promise<Interest[]> {
  return [...loadInterests()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type MutualMatch = {
  profileA: MatrimonialProfile;
  profileB: MatrimonialProfile;
  // The later of the two interest timestamps — the moment it became mutual.
  matchedAt: string;
};

// A mutual match exists between listings P1 and P2 when P1's managing member
// expressed interest in P2 AND P2's managing member expressed interest in P1.
// Listings without a managing member can receive interest but can never
// reciprocate, so they never appear here. Pure function over already-loaded
// data — callers have users/profiles/interests in hand anyway.
export function findMutualMatches(
  interests: Interest[],
  profiles: MatrimonialProfile[]
): MutualMatch[] {
  const byOwner = new Map<string, MatrimonialProfile[]>();
  for (const p of profiles) {
    if (!p.ownerUserId) continue;
    const list = byOwner.get(p.ownerUserId) ?? [];
    list.push(p);
    byOwner.set(p.ownerUserId, list);
  }

  const liked = new Map<string, Interest>(); // "userId->profileId" -> interest
  for (const i of interests) {
    liked.set(`${i.userId}->${i.profileId}`, i);
  }

  const matches: MutualMatch[] = [];
  const seenPairs = new Set<string>();

  for (const i of interests) {
    const targetProfile = profiles.find((p) => p.id === i.profileId);
    if (!targetProfile?.ownerUserId) continue;

    // Does the target's manager like any listing managed by the sender?
    for (const senderProfile of byOwner.get(i.userId) ?? []) {
      const reciprocal = liked.get(
        `${targetProfile.ownerUserId}->${senderProfile.id}`
      );
      if (!reciprocal) continue;

      const pairKey = [senderProfile.id, targetProfile.id].sort().join("|");
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      matches.push({
        profileA: senderProfile,
        profileB: targetProfile,
        matchedAt:
          i.createdAt > reciprocal.createdAt ? i.createdAt : reciprocal.createdAt,
      });
    }
  }

  return matches.sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}
