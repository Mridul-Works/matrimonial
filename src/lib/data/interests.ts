import "server-only";
import { readStore, writeStore } from "@/lib/data/store";

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
