"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/dal";
import { toggleInterest } from "@/lib/data/interests";

export async function toggleInterestAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  // Admins oversee the service; they don't participate in it. The UI hides
  // the button for them, but this is the real gate — a crafted POST from an
  // admin session must not create an interest either.
  if (user.role === "admin") return;

  const toUserId = String(formData.get("toUserId") ?? "");
  if (!toUserId || toUserId === user.id) return;

  await toggleInterest(user.id, toUserId);

  const redirectTo = String(formData.get("redirectTo") ?? "/profiles");
  revalidatePath(redirectTo);
  revalidatePath("/matches");
  revalidatePath("/profiles");
}
