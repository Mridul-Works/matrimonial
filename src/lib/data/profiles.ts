import "server-only";
import { readStore, writeStore } from "@/lib/data/store";

export type MatrimonialProfile = {
  id: string;
  codeNo: string;
  name: string;
  gender: "male" | "female";
  dob: string; // ISO date, e.g. "1993-11-04"
  heightLabel: string;
  education: string[];
  profession: string;
  workExperience: string;
  family: { label: string; value: string }[];
  partnerPreference: string;
  photoUrl?: string;
  createdAt: string;
};

// Seed data for the showcase, persisted to a JSON file on first read.
// Swap this module for a real database query (Prisma, Postgres, etc.) once
// the app moves past demo stage.
const SEED_PROFILES: MatrimonialProfile[] = [
  {
    id: "42-26",
    codeNo: "42/26",
    name: "Sarbjeet Singh",
    gender: "male",
    dob: "1993-11-04",
    heightLabel: "5'11\" (180 cm)",
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
    id: "17-26",
    codeNo: "17/26",
    name: "Simran Kaur",
    gender: "female",
    dob: "1996-03-12",
    heightLabel: "5'4\" (163 cm)",
    education: ["Bachelor of Commerce (B.Com)", "Diploma in Fashion Designing"],
    profession: "Boutique Owner",
    workExperience: "Runs a small boutique in Ludhiana for the past 3 years.",
    family: [
      { label: "Brother", value: "1 (Unmarried)" },
      { label: "Sister", value: "0" },
    ],
    partnerPreference:
      "Looking for a well-settled, respectful groom from a good family background who supports her working after marriage.",
    createdAt: new Date(2026, 0, 1).toISOString(),
  },
  {
    id: "08-26",
    codeNo: "08/26",
    name: "Aman Sharma",
    gender: "male",
    dob: "1991-07-22",
    heightLabel: "5'9\" (175 cm)",
    education: ["B.Tech (Computer Science)"],
    profession: "Software Engineer",
    workExperience: "Working with an IT company in Chandigarh for 4 years.",
    family: [
      { label: "Brother", value: "0" },
      { label: "Sister", value: "2 (Both Married)" },
    ],
    partnerPreference:
      "Seeking an educated, homely girl who is understanding and supportive, open to settling in Chandigarh.",
    createdAt: new Date(2026, 0, 1).toISOString(),
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

export type ProfileFilters = {
  q?: string;
  gender?: "male" | "female";
  minAge?: number;
  maxAge?: number;
};

export async function getProfiles(filters?: ProfileFilters): Promise<MatrimonialProfile[]> {
  const profiles = loadProfiles();
  if (!filters) return profiles;

  const q = filters.q?.trim().toLowerCase();

  return profiles.filter((profile) => {
    if (filters.gender && profile.gender !== filters.gender) return false;

    const age = calculateAge(profile.dob);
    if (filters.minAge !== undefined && age < filters.minAge) return false;
    if (filters.maxAge !== undefined && age > filters.maxAge) return false;

    if (q) {
      const haystack = [
        profile.name,
        profile.profession,
        profile.codeNo,
        ...profile.education,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export async function getProfileById(
  id: string
): Promise<MatrimonialProfile | undefined> {
  return loadProfiles().find((profile) => profile.id === id);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProfile(input: {
  codeNo: string;
  name: string;
  gender: "male" | "female";
  dob: string;
  heightLabel: string;
  education: string[];
  profession: string;
  workExperience: string;
  family: { label: string; value: string }[];
  partnerPreference: string;
}): Promise<MatrimonialProfile> {
  const profiles = loadProfiles();
  const profile: MatrimonialProfile = {
    ...input,
    id: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  profiles.push(profile);
  writeStore("profiles", profiles);
  return profile;
}
