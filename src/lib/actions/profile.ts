"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/dal";
import { updateProfile } from "@/lib/data/profiles";

export type ProfileFormState =
  | { errors?: Record<string, string[]>; message?: string; saved?: boolean }
  | undefined;

export async function updateMyProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getUser();
  if (!user) return { message: "You must be signed in." };
  // Admins have no profile of their own to edit.
  if (user.role === "admin") return { message: "Admins don't have a profile." };

  const name = String(formData.get("name") ?? "").trim();
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
  if (name.length < 2) errors.name = ["Enter your full name."];
  if (gender !== "male" && gender !== "female") errors.gender = ["Select a gender."];
  if (!dob) errors.dob = ["Date of birth is required."];
  if (!city) errors.city = ["City is required."];
  if (!profession) errors.profession = ["Profession is required."];

  if (Object.keys(errors).length > 0) return { errors };

  const education = educationRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  await updateProfile(user.id, {
    name,
    gender: gender as "male" | "female",
    dob,
    heightLabel: heightLabel || "Not specified",
    city,
    profession,
    education: education.length > 0 ? education : ["Not specified"],
    workExperience: workExperience || "Not specified",
    family: [
      { label: "Brother", value: brother || "0" },
      { label: "Sister", value: sister || "0" },
    ],
    partnerPreference: partnerPreference || "Not specified",
  });

  revalidatePath("/my-profile");
  revalidatePath("/profiles");
  revalidatePath(`/profiles/${user.id}`);

  return { saved: true };
}
