import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

/**
 * Clears a session whose user no longer exists.
 *
 * A signed cookie can outlive the account it points at — the member was
 * removed, or the demo data was reseeded with new ids. When that happens the
 * proxy still sees a valid-looking cookie and bounces the visitor off /login,
 * while the pages can't find the user and bounce them back: an infinite
 * redirect loop. Server Components aren't allowed to delete cookies, so those
 * pages redirect here instead — a Route Handler can, breaking the loop.
 */
export async function GET(request: Request) {
  await deleteSession();
  return NextResponse.redirect(new URL("/login?expired=1", request.url));
}
