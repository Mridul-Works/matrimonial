import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedPrefixes = ["/profiles", "/matches", "/admin"];
const authOnlyRoutes = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthOnlyRoute = authOnlyRoutes.includes(pathname);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnlyRoute && session?.userId) {
    return NextResponse.redirect(new URL("/profiles", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
