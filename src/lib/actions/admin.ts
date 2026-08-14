"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { createProfileForUser, updateProfile } from "@/lib/data/profiles";
import { createUser, findUserByUsername } from "@/lib/data/users";

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

  if (username && (await findUserByUsername(username))) {
    errors.username = ["This username is already taken."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const user = await createUser({ name, username, password });
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
