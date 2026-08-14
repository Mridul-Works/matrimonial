import "server-only";
import bcrypt from "bcryptjs";
import { readStore, writeStore } from "@/lib/data/store";

export type UserRole = "admin" | "member";

export type AppUser = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
};

// Every member account owns exactly one profile, keyed by the same id
// (see lib/data/profiles.ts). Admins have no profile — they oversee only.
// Seed data is persisted to a JSON file on first read; swap this module for
// a real database before shipping beyond a demo.
const SEED_USERS: AppUser[] = [
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

function loadUsers(): AppUser[] {
  return readStore("users", SEED_USERS);
}

export async function findUserByUsername(username: string): Promise<AppUser | undefined> {
  return loadUsers().find((user) => user.username.toLowerCase() === username.toLowerCase());
}

export async function findUserById(id: string): Promise<AppUser | undefined> {
  return loadUsers().find((user) => user.id === id);
}

export async function createUser(input: {
  name: string;
  username: string;
  password: string;
}): Promise<AppUser> {
  const users = loadUsers();
  const user: AppUser = {
    id: `u-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name,
    username: input.username,
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: "member",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeStore("users", users);
  return user;
}

export async function verifyPassword(user: AppUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function getAllUsers(): Promise<AppUser[]> {
  return [...loadUsers()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
