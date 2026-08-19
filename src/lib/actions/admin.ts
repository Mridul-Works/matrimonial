"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { createProfileForUser, updateProfile } from "@/lib/data/profiles";
import {
  createUser,
  findUserByPhone,
  findUserByUsername,
  setCallNote,
  setPhoneVerified,
} from "@/lib/data/users";
import { normalizeIndianMobile } from "@/lib/phone";

export type CreateProfileFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

/**
 * Admin registers a member on their behalf — the walk-in case, where a family
 * gives their details in person. Every profile belongs to an account, so this
 * creates both, exactly like self-registration does.
 */
export async function createProfileAction(
  _prevState: CreateProfileFormState,
  formData: FormData
): Promise<CreateProfileFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const dob = String(formData.get("dob") ?? "");
  const heightLabel = String(formData.get("heightLabel") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();
  const educationRaw = String(formData.get("education") ?? "");
  const workExperience = String(formData.get("workExperience") ?? "").trim();
  const brother = String(formData.get("brother") ?? "").trim();
  const sister = String(formData.get("sister") ?? "").trim();
  const partnerPreference = String(formData.get("partnerPreference") ?? "").trim();

  const errors: Record<string, string[]> = {};
  if (name.length < 2) errors.name = ["Enter a valid name."];
  if (username.length < 3) errors.username = ["Username must be at least 3 characters."];
  if (password.length < 3) errors.password = ["Password must be at least 3 characters."];
  if (gender !== "male" && gender !== "female") errors.gender = ["Select a gender."];
  if (!dob) errors.dob = ["Date of birth is required."];
  if (!city) errors.city = ["City is required."];
  if (!profession) errors.profession = ["Profession is required."];

  const phone = normalizeIndianMobile(phoneRaw);
  if (!phoneRaw) {
    errors.phone = ["Mobile number is required."];
  } else if (!phone) {
    errors.phone = ["Enter a valid 10-digit Indian mobile number."];
  }

  if (username && (await findUserByUsername(username))) {
    errors.username = ["This username is already taken."];
  }
  if (phone && (await findUserByPhone(phone))) {
    errors.phone = ["This mobile number belongs to an existing member."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Walk-in numbers are taken face-to-face, so they count as verified —
  // no confirmation call needed.
  const user = await createUser({
    name,
    username,
    password,
    phone,
    phoneVerified: true,
  });
  await createProfileForUser({
    userId: user.id,
    name,
    gender: gender as "male" | "female",
    dob,
    city,
    profession,
  });

  // Fill in the optional biodata the basic registration doesn't collect.
  const education = educationRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  await updateProfile(user.id, {
    heightLabel: heightLabel || "Not specified",
    education: education.length > 0 ? education : ["Not specified"],
    workExperience: workExperience || "Not specified",
    family: [
      { label: "Brother", value: brother || "0" },
      { label: "Sister", value: sister || "0" },
    ],
    partnerPreference: partnerPreference || "Not specified",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath("/admin/members");
  revalidatePath("/profiles");
  redirect("/admin/profiles?created=1");
}

/**
 * Admin records the outcome of the confirmation call: marks a member's
 * number verified, or reverts it to pending if it was marked by mistake.
 */
export async function setPhoneVerifiedAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const verified = String(formData.get("verified") ?? "") === "true";
  if (!userId) return;

  await setPhoneVerified(userId, verified);
  // The chip renders on the Members tab and on pair-detail pages, so
  // refresh the whole admin section rather than tracking each route.
  revalidatePath("/admin", "layout");
}

/**
 * Admin saves a scratch note about the confirmation call
 * ("didn't pick up, retry Tuesday"). An empty note clears it.
 */
export async function saveCallNoteAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!userId) return;

  await setCallNote(userId, note);
  revalidatePath("/admin", "layout");
}
