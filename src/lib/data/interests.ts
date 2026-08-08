import "server-only";
import { readStore, writeStore } from "@/lib/data/store";

export type Interest = {
  id: string;
  userId: string;
  profileId: string;
  createdAt: string;
};

const SEED_INTERESTS: Interest[] = [];

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
