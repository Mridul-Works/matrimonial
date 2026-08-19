import bcrypt from "bcryptjs";
import type { AppUser } from "./users";
import type { MatrimonialProfile } from "./profiles";
import type { Interest } from "./interests";

// Demo data inserted on the very first run, when the database is empty and
// there is no legacy JSON store to migrate (see db.ts). Password for every
// member is <username>123; the admin is admin/admin — change before launch.

export const SEED_USERS: AppUser[] = [
  {
    id: "admin",
    name: "Admin",
    username: "admin",
    passwordHash: bcrypt.hashSync("admin", 10),
    role: "admin",
    createdAt: new Date(2026, 0, 1).toISOString(),
  },
  {
    id: "u-sarbjeet",
    name: "Sarbjeet Singh",
    username: "sarbjeet",
    passwordHash: bcrypt.hashSync("sarbjeet123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 1).toISOString(),
  },
  {
    id: "u-simran",
    name: "Simran Kaur",
    username: "simran",
    passwordHash: bcrypt.hashSync("simran123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 2).toISOString(),
  },
  {
    id: "u-aman",
    name: "Aman Sharma",
    username: "aman",
    passwordHash: bcrypt.hashSync("aman123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 3).toISOString(),
  },
  {
    id: "u-priya",
    name: "Priya Verma",
    username: "priya",
    passwordHash: bcrypt.hashSync("priya123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 5).toISOString(),
  },
  {
    id: "u-gurpreet",
    name: "Gurpreet Singh",
    username: "gurpreet",
    passwordHash: bcrypt.hashSync("gurpreet123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 8).toISOString(),
  },
  {
    id: "u-neha",
    name: "Neha Kumari",
    username: "neha",
    passwordHash: bcrypt.hashSync("neha123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 10).toISOString(),
  },
  {
    id: "u-rahul",
    name: "Rahul Nagpal",
    username: "rahul",
    passwordHash: bcrypt.hashSync("rahul123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 12).toISOString(),
  },
  {
    id: "u-anjali",
    name: "Anjali Sain",
    username: "anjali",
    passwordHash: bcrypt.hashSync("anjali123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 15).toISOString(),
  },
  {
    id: "u-vikram",
    name: "Vikram Sain",
    username: "vikram",
    passwordHash: bcrypt.hashSync("vikram123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 18).toISOString(),
  },
];

export const SEED_PROFILES: MatrimonialProfile[] = [
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

export const SEED_INTERESTS: Interest[] = [
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
