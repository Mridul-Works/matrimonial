import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { findUserById } from "@/lib/data/users";

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

// Optimistic check that never redirects — use for nav/header rendering.
export const getOptionalSession = cache(async () => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);
  return session?.userId ? { userId: session.userId } : null;
});

export const getUser = cache(async () => {
  const session = await getOptionalSession();
  if (!session) return null;

  const user = await findUserById(session.userId);
  if (!user) return null;

  return { id: user.id, name: user.name, username: user.username, role: user.role };
});

// Secure check: confirms the session is valid AND the user is an admin.
// Redirects non-admins away, so pages using this never render for them.
export const requireAdmin = cache(async () => {
  const session = await verifySession();
  const user = await findUserById(session.userId);

  if (!user || user.role !== "admin") {
    redirect("/profiles");
  }

  return user;
});
