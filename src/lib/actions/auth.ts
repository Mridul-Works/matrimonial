"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import {
  createUser,
  findUserByPhone,
  findUserByUsername,
  verifyPassword,
} from "@/lib/data/users";
import { createProfileForUser } from "@/lib/data/profiles";
import { normalizeIndianMobile } from "@/lib/phone";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        username?: string[];
        password?: string[];
        phone?: string[];
        gender?: string[];
        dob?: string[];
        city?: string[];
        profession?: string[];
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
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const dob = String(formData.get("dob") ?? "");
  const city = String(formData.get("city") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();

  const errors: NonNullable<AuthFormState>["errors"] = {};
  if (name.length < 2) errors.name = ["Enter your full name."];
  if (username.length < 3)
    errors.username = ["Username must be at least 3 characters."];
  if (password.length < 3)
    errors.password = ["Password must be at least 3 characters."];
  const phone = normalizeIndianMobile(phoneRaw);
  if (!phoneRaw) {
    errors.phone = ["Mobile number is required."];
  } else if (!phone) {
    errors.phone = ["Enter a valid 10-digit Indian mobile number."];
  }
  if (gender !== "male" && gender !== "female") errors.gender = ["Select a gender."];
  if (!dob) {
    errors.dob = ["Date of birth is required."];
  } else {
    const age =
      (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 18) errors.dob = ["You must be at least 18 to register."];
  }
  if (!city) errors.city = ["City is required."];
  if (!profession) errors.profession = ["Profession is required."];

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existing = await findUserByUsername(username);
  if (existing) {
    return { errors: { username: ["This username is already taken."] } };
  }
  if (phone && (await findUserByPhone(phone))) {
    return {
      errors: {
        phone: [
          "This mobile number is already registered. If it is yours, please log in instead.",
        ],
      },
    };
  }

  // Account and profile are created together — every member is browsable,
  // so there is never an account without a listing. The phone number starts
  // unverified; the admin marks it verified after the confirmation call.
  const user = await createUser({ name, username, password, phone });
  await createProfileForUser({
    userId: user.id,
    name,
    gender: gender as "male" | "female",
    dob,
    city,
    profession,
  });

  await createSession(user.id);
  redirect("/my-profile?welcome=1");
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
  // Admins land in the console; members land in the browse view.
  redirect(user.role === "admin" ? "/admin" : "/profiles");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
