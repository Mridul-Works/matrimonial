import "server-only";
import { readStore, writeStore } from "@/lib/data/store";
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

const SEED_PROFILES: MatrimonialProfile[] = [
  {
    id: "u-sarbjeet",
    codeNo: "42/26",
    name: "Sarbjeet Singh",
    gender: "male",
    dob: "1993-11-04",
    heightLabel: "5'11\" (180 cm)",
    city: "Jalandhar",
    education: ["Senior Secondary (+2)", "ITI – Electrician"],
    profession: "Electrician",
    workExperience:
      "Worked as an Electrician in Dubai. Currently residing in India.",
    family: [
      { label: "Brother", value: "1 (Married)" },
      { label: "Sister", value: "1 (Married)" },
    ],
    partnerPreference:
      "Looking for a simple, caring, and family-oriented girl who values family traditions and relationships.",
    createdAt: new Date(2026, 0, 1).toISOString(),
  },
  {
    id: "u-simran",
    codeNo: "17/26",
    name: "Simran Kaur",
    gender: "female",
    dob: "1996-03-12",
    heightLabel: "5'4\" (163 cm)",
    city: "Ludhiana",
    education: ["Bachelor of Commerce (B.Com)", "Diploma in Fashion Designing"],
    profession: "Boutique Owner",
    workExperience: "Runs a small boutique in Ludhiana for the past 3 years.",
    family: [
      { label: "Brother", value: "1 (Unmarried)" },
      { label: "Sister", value: "0" },
    ],
    partnerPreference:
      "Looking for a well-settled, respectful groom from a good family background who supports her working after marriage.",
    createdAt: new Date(2026, 0, 2).toISOString(),
  },
  {
    id: "u-aman",
    codeNo: "08/26",
    name: "Aman Sharma",
    gender: "male",
    dob: "1991-07-22",
    heightLabel: "5'9\" (175 cm)",
    city: "Chandigarh",
    education: ["B.Tech (Computer Science)"],
    profession: "Software Engineer",
    workExperience: "Working with an IT company in Chandigarh for 4 years.",
    family: [
      { label: "Brother", value: "0" },
      { label: "Sister", value: "2 (Both Married)" },
    ],
    partnerPreference:
      "Seeking an educated, homely girl who is understanding and supportive, open to settling in Chandigarh.",
    createdAt: new Date(2026, 0, 3).toISOString(),
  },
  {
    id: "u-priya",
    codeNo: "23/26",
    name: "Priya Verma",
    gender: "female",
    dob: "1998-09-05",
    heightLabel: "5'3\" (160 cm)",
    city: "Amritsar",
    education: ["MBBS"],
    profession: "Doctor",
    workExperience: "Junior resident at a government hospital in Amritsar.",
    family: [
      { label: "Brother", value: "1 (Unmarried)" },
      { label: "Sister", value: "1 (Married)" },
    ],
    partnerPreference:
      "Prefers an educated, open-minded partner who respects her medical career and on-call schedule.",
    createdAt: new Date(2026, 0, 5).toISOString(),
  },
  {
    id: "u-gurpreet",
    codeNo: "31/26",
    name: "Gurpreet Singh",
    gender: "male",
    dob: "1995-01-18",
    heightLabel: "6'0\" (183 cm)",
    city: "Patiala",
    education: ["B.A.", "Diploma in Hotel Management"],
    profession: "Restaurant Manager",
    workExperience: "Manages a family-owned restaurant in Patiala.",
    family: [
      { label: "Brother", value: "1 (Married)" },
      { label: "Sister", value: "0" },
    ],
    partnerPreference:
      "Looking for a cheerful, family-oriented girl; someone who enjoys food and hospitality is a bonus.",
    createdAt: new Date(2026, 0, 8).toISOString(),
  },
  {
    id: "u-neha",
    codeNo: "12/26",
    name: "Neha Kumari",
    gender: "female",
    dob: "1994-12-30",
    heightLabel: "5'5\" (165 cm)",
    city: "Delhi",
    education: ["B.Ed", "M.A. (English)"],
    profession: "School Teacher",
    workExperience: "Teaches English at a private school in Delhi for 6 years.",
    family: [
      { label: "Brother", value: "2 (Both Married)" },
      { label: "Sister", value: "0" },
    ],
    partnerPreference:
      "Seeking a kind, stable partner who values education and a quiet family life.",
    createdAt: new Date(2026, 0, 10).toISOString(),
  },
  {
    id: "u-rahul",
    codeNo: "56/26",
    name: "Rahul Nagpal",
    gender: "male",
    dob: "1997-06-14",
    heightLabel: "5'8\" (173 cm)",
    city: "Gurugram",
    education: ["B.Com", "CA (Inter)"],
    profession: "Accountant",
    workExperience: "Accounts executive at a logistics firm in Gurugram.",
    family: [
      { label: "Brother", value: "0" },
      { label: "Sister", value: "1 (Unmarried)" },
    ],
    partnerPreference:
      "Looking for a practical, warm-hearted girl; working or homely both welcome.",
    createdAt: new Date(2026, 0, 12).toISOString(),
  },
  {
    id: "u-anjali",
    codeNo: "61/26",
    name: "Anjali Sain",
    gender: "female",
    dob: "1999-04-21",
    heightLabel: "5'2\" (158 cm)",
    city: "Jaipur",
    education: ["B.Sc (Nursing)"],
    profession: "Staff Nurse",
    workExperience: "Staff nurse at a private hospital in Jaipur.",
    family: [
      { label: "Brother", value: "1 (Unmarried)" },
      { label: "Sister", value: "2 (One Married)" },
    ],
    partnerPreference:
      "Wants a caring, respectful partner from a god-fearing family; city or town both fine.",
    createdAt: new Date(2026, 0, 15).toISOString(),
  },
  {
    id: "u-vikram",
    codeNo: "77/26",
    name: "Vikram Sain",
    gender: "male",
    dob: "1989-10-02",
    heightLabel: "5'10\" (178 cm)",
    city: "Ambala",
    education: ["Diploma (Mechanical)"],
    profession: "Workshop Owner",
    workExperience: "Runs his own two-wheeler workshop in Ambala for 8 years.",
    family: [
      { label: "Brother", value: "1 (Married)" },
      { label: "Sister", value: "1 (Married)" },
    ],
    partnerPreference:
      "Simple living, honest girl who values family; caste no bar within community.",
    createdAt: new Date(2026, 0, 18).toISOString(),
  },
];

function loadProfiles(): MatrimonialProfile[] {
  return readStore("profiles", SEED_PROFILES);
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
  return loadProfiles().find((profile) => profile.id === id);
}

export const getProfileByUserId = getProfileById;

export async function getProfilesByIds(ids: string[]): Promise<MatrimonialProfile[]> {
  const profiles = loadProfiles();
  return ids
    .map((id) => profiles.find((p) => p.id === id))
    .filter((p): p is MatrimonialProfile => Boolean(p));
}

function nextCodeNo(profiles: MatrimonialProfile[]): string {
  const year = new Date().getFullYear() % 100;
  const highest = profiles.reduce((max, p) => {
    const n = Number(p.codeNo.split("/")[0]);
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
  const profiles = loadProfiles();
  const profile: MatrimonialProfile = {
    id: input.userId,
    codeNo: nextCodeNo(profiles),
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
  profiles.push(profile);
  writeStore("profiles", profiles);
  return profile;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Omit<MatrimonialProfile, "id" | "codeNo" | "createdAt">>
): Promise<MatrimonialProfile | undefined> {
  const profiles = loadProfiles();
  const index = profiles.findIndex((p) => p.id === userId);
  if (index < 0) return undefined;

  profiles[index] = { ...profiles[index], ...patch };
  writeStore("profiles", profiles);
  return profiles[index];
}
