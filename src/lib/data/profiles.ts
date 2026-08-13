import "server-only";
import { readStore, writeStore } from "@/lib/data/store";

export type MatrimonialProfile = {
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
    id: "17-26",
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
    id: "08-26",
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
    id: "23-26",
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
    id: "31-26",
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
    id: "12-26",
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
    id: "56-26",
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
    id: "61-26",
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
    id: "77-26",
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
};

export async function getProfiles(filters?: ProfileFilters): Promise<MatrimonialProfile[]> {
  const profiles = loadProfiles();
  if (!filters) return profiles;

  const q = filters.q?.trim().toLowerCase();

  const result = profiles.filter((profile) => {
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
  city: string;
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
