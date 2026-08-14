"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/dal";
import { toggleInterest } from "@/lib/data/interests";

export async function toggleInterestAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  // Admins oversee the service; they don't participate in it. The UI hides
  // the button for them, but the action is the real gate — a crafted POST
  // from an admin session must not create an interest either.
  if (user.role === "admin") return;

  const profileId = String(formData.get("profileId") ?? "");
  if (!profileId) return;

  await toggleInterest(user.id, profileId);

  const redirectTo = String(formData.get("redirectTo") ?? "/profiles");
  revalidatePath(redirectTo);
  revalidatePath("/matches");
}
