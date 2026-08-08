"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { toggleInterest } from "@/lib/data/interests";

export async function toggleInterestAction(formData: FormData) {
  const session = await verifySession();
  const profileId = String(formData.get("profileId") ?? "");
  if (!profileId) return;

  await toggleInterest(session.userId, profileId);

  const redirectTo = String(formData.get("redirectTo") ?? "/profiles");
  revalidatePath(redirectTo);
  revalidatePath("/matches");
}
