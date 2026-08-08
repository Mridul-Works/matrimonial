"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { createProfile } from "@/lib/data/profiles";

export type CreateProfileFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export async function createProfileAction(
  _prevState: CreateProfileFormState,
  formData: FormData
): Promise<CreateProfileFormState> {
  await requireAdmin();

  const codeNo = String(formData.get("codeNo") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const dob = String(formData.get("dob") ?? "");
  const heightLabel = String(formData.get("heightLabel") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();
  const educationRaw = String(formData.get("education") ?? "");
  const workExperience = String(formData.get("workExperience") ?? "").trim();
  const brother = String(formData.get("brother") ?? "").trim();
  const sister = String(formData.get("sister") ?? "").trim();
  const partnerPreference = String(formData.get("partnerPreference") ?? "").trim();

  const errors: Record<string, string[]> = {};
  if (!codeNo) errors.codeNo = ["Code No is required."];
  if (name.length < 2) errors.name = ["Enter a valid name."];
  if (gender !== "male" && gender !== "female") errors.gender = ["Select a gender."];
  if (!dob) errors.dob = ["Date of birth is required."];
  if (!heightLabel) errors.heightLabel = ["Height is required."];
  if (!profession) errors.profession = ["Profession is required."];

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const education = educationRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  await createProfile({
    codeNo,
    name,
    gender: gender as "male" | "female",
    dob,
    heightLabel,
    education: education.length > 0 ? education : ["Not specified"],
    profession,
    workExperience: workExperience || "Not specified",
    family: [
      { label: "Brother", value: brother || "0" },
      { label: "Sister", value: sister || "0" },
    ],
    partnerPreference: partnerPreference || "Not specified",
  });

  revalidatePath("/admin");
  revalidatePath("/profiles");
  redirect("/admin?created=1");
}
