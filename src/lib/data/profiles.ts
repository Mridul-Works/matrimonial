import "server-only";
import { getDb } from "@/lib/data/db";
import { getAllUsers } from "@/lib/data/users";

export type MatrimonialProfile = {
  // Same value as the owning user's id — every member account has exactly
  // one profile, and a profile always belongs to exactly one member.
  // Admins have no profile; they oversee rather than participate.
  id: string;
  codeNo: string;
  name: string;
  gender: "male" | "female";
  dob: string; // ISO date, e.g. "1993-11-04"
  heightLabel: string;
  city: string;
  education: string[];
  profession: string;
  workExperience: string;
  family: { label: string; value: string }[];
  partnerPreference: string;
  photoUrl?: string;
  createdAt: string;
};

type ProfileRow = {
  id: string;
  code_no: string;
  name: string;
  gender: string;
  dob: string;
  height_label: string;
  city: string;
  education: string;
  profession: string;
  work_experience: string;
  family: string;
  partner_preference: string;
  photo_url: string | null;
  created_at: string;
};

function rowToProfile(row: ProfileRow): MatrimonialProfile {
  return {
    id: row.id,
    codeNo: row.code_no,
    name: row.name,
    gender: row.gender as "male" | "female",
    dob: row.dob,
    heightLabel: row.height_label,
    city: row.city,
    education: JSON.parse(row.education) as string[],
    profession: row.profession,
    workExperience: row.work_experience,
    family: JSON.parse(row.family) as { label: string; value: string }[],
    partnerPreference: row.partner_preference,
    photoUrl: row.photo_url ?? undefined,
    createdAt: row.created_at,
  };
}

function loadProfiles(): MatrimonialProfile[] {
  const rows = getDb().prepare("SELECT * FROM profiles").all() as ProfileRow[];
  return rows.map(rowToProfile);
}

export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function formatDob(dob: string): string {
  return new Date(dob).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export type ProfileSort = "newest" | "age-asc" | "age-desc";

export type ProfileFilters = {
  q?: string;
  gender?: "male" | "female";
  minAge?: number;
  maxAge?: number;
  sort?: ProfileSort;
  // Hide one profile from results — used to keep a member from browsing
  // (or expressing interest in) themselves.
  excludeUserId?: string;
};

// Filtering happens in memory over the full table — age is derived from
// dob and search spans JSON columns, so SQL buys little at this scale.
// If the community outgrows this, precompute age and use SQL LIKE here.
export async function getProfiles(filters?: ProfileFilters): Promise<MatrimonialProfile[]> {
  const profiles = loadProfiles();
  if (!filters) return profiles;

  const q = filters.q?.trim().toLowerCase();

  // Usernames are searchable too — members know each other by handle.
  const usernameById = new Map<string, string>();
  if (q) {
    for (const u of await getAllUsers()) usernameById.set(u.id, u.username);
  }

  const result = profiles.filter((profile) => {
    if (filters.excludeUserId && profile.id === filters.excludeUserId) return false;
    if (filters.gender && profile.gender !== filters.gender) return false;

    const age = calculateAge(profile.dob);
    if (filters.minAge !== undefined && age < filters.minAge) return false;
    if (filters.maxAge !== undefined && age > filters.maxAge) return false;

    if (q) {
      const haystack = [
        profile.name,
        profile.profession,
        profile.codeNo,
        profile.city,
        usernameById.get(profile.id) ?? "",
        ...profile.education,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  switch (filters.sort) {
    case "age-asc":
      result.sort((a, b) => calculateAge(a.dob) - calculateAge(b.dob));
      break;
    case "age-desc":
      result.sort((a, b) => calculateAge(b.dob) - calculateAge(a.dob));
      break;
    case "newest":
    default:
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return result;
}

// A profile's id IS its owner's user id, so these are the same lookup —
// both names exist because call sites read more clearly one way or the other.
export async function getProfileById(
  id: string
): Promise<MatrimonialProfile | undefined> {
  const row = getDb().prepare("SELECT * FROM profiles WHERE id = ?").get(id) as
    | ProfileRow
    | undefined;
  return row ? rowToProfile(row) : undefined;
}

export const getProfileByUserId = getProfileById;

export async function getProfilesByIds(ids: string[]): Promise<MatrimonialProfile[]> {
  const results: MatrimonialProfile[] = [];
  for (const id of ids) {
    const profile = await getProfileById(id);
    if (profile) results.push(profile);
  }
  return results;
}

function nextCodeNo(): string {
  const year = new Date().getFullYear() % 100;
  const rows = getDb().prepare("SELECT code_no FROM profiles").all() as {
    code_no: string;
  }[];
  const highest = rows.reduce((max, r) => {
    const n = Number(r.code_no.split("/")[0]);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${String(highest + 1).padStart(2, "0")}/${year}`;
}

// Called during registration — a member and their profile are created
// together, so there is never an account without a listing.
export async function createProfileForUser(input: {
  userId: string;
  name: string;
  gender: "male" | "female";
  dob: string;
  city: string;
  profession: string;
}): Promise<MatrimonialProfile> {
  const profile: MatrimonialProfile = {
    id: input.userId,
    codeNo: nextCodeNo(),
    name: input.name,
    gender: input.gender,
    dob: input.dob,
    heightLabel: "Not specified",
    city: input.city,
    education: ["Not specified"],
    profession: input.profession,
    workExperience: "Not specified",
    family: [
      { label: "Brother", value: "0" },
      { label: "Sister", value: "0" },
    ],
    partnerPreference: "Not specified",
    createdAt: new Date().toISOString(),
  };

  getDb()
    .prepare(
      `INSERT INTO profiles (id, code_no, name, gender, dob, height_label, city,
                             education, profession, work_experience, family,
                             partner_preference, photo_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      profile.id,
      profile.codeNo,
      profile.name,
      profile.gender,
      profile.dob,
      profile.heightLabel,
      profile.city,
      JSON.stringify(profile.education),
      profile.profession,
      profile.workExperience,
      JSON.stringify(profile.family),
      profile.partnerPreference,
      null,
      profile.createdAt
    );

  return profile;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Omit<MatrimonialProfile, "id" | "codeNo" | "createdAt">>
): Promise<MatrimonialProfile | undefined> {
  const existing = await getProfileById(userId);
  if (!existing) return undefined;

  const updated: MatrimonialProfile = { ...existing, ...patch };
  getDb()
    .prepare(
      `UPDATE profiles SET name = ?, gender = ?, dob = ?, height_label = ?,
                           city = ?, education = ?, profession = ?,
                           work_experience = ?, family = ?,
                           partner_preference = ?, photo_url = ?
       WHERE id = ?`
    )
    .run(
      updated.name,
      updated.gender,
      updated.dob,
      updated.heightLabel,
      updated.city,
      JSON.stringify(updated.education),
      updated.profession,
      updated.workExperience,
      JSON.stringify(updated.family),
      updated.partnerPreference,
      updated.photoUrl ?? null,
      userId
    );

  return updated;
}
