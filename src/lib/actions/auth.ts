"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import {
  createUser,
  findUserByUsername,
  verifyPassword,
} from "@/lib/data/users";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        username?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: NonNullable<AuthFormState>["errors"] = {};
  if (name.length < 2) errors.name = ["Enter your full name."];
  if (username.length < 3)
    errors.username = ["Username must be at least 3 characters."];
  if (password.length < 3)
    errors.password = ["Password must be at least 3 characters."];

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existing = await findUserByUsername(username);
  if (existing) {
    return { errors: { username: ["This username is already taken."] } };
  }

  const user = await createUser({ name, username, password });
  await createSession(user.id);
  redirect("/profiles");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { message: "Enter your username and password." };
  }

  const user = await findUserByUsername(username);
  const passwordMatches = user ? await verifyPassword(user, password) : false;

  if (!user || !passwordMatches) {
    return { message: "Invalid username or password." };
  }

  await createSession(user.id);
  redirect("/profiles");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
