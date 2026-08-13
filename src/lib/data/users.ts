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

// Seed data for the showcase, persisted to a JSON file on first read.
// Swap this module for a real database before shipping this beyond a demo.
const SEED_USERS: AppUser[] = [
  {
    id: "admin",
    name: "Admin",
    username: "admin",
    passwordHash: bcrypt.hashSync("admin", 10),
    role: "admin",
    createdAt: new Date(2026, 0, 1).toISOString(),
  },
  // Demo members so the admin panel has activity to show out of the box.
  {
    id: "member-ravi",
    name: "Ravi Sain",
    username: "ravi",
    passwordHash: bcrypt.hashSync("ravi123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 6).toISOString(),
  },
  {
    id: "member-pooja",
    name: "Pooja Devi",
    username: "pooja",
    passwordHash: bcrypt.hashSync("pooja123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 9).toISOString(),
  },
  {
    id: "member-harish",
    name: "Harish Kumar",
    username: "harish",
    passwordHash: bcrypt.hashSync("harish123", 10),
    role: "member",
    createdAt: new Date(2026, 0, 14).toISOString(),
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
    id: crypto.randomUUID(),
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
