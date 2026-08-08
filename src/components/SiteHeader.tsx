import Link from "next/link";
import { getUser } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import HeartIcon from "@/components/HeartIcon";

export default async function SiteHeader() {
  const user = await getUser();

  const navLinkClasses =
    "font-medium text-zinc-600 hover:text-pink-600 dark:text-zinc-300 dark:hover:text-pink-300";
  const mobileLinkClasses =
    "block rounded-xl px-3 py-2 font-medium text-zinc-700 hover:bg-pink-50 dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <header className="border-b border-pink-100/60 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-heading text-lg text-pink-600 dark:text-pink-300 sm:text-xl"
        >
          <HeartIcon className="h-4 w-4 shrink-0 text-pink-400" />
          Sain Smajh Matrimonial
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          {user ? (
            <>
              <Link href="/profiles" className={navLinkClasses}>
                Browse Profiles
              </Link>
              <Link href="/matches" className={navLinkClasses}>
                My Matches
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className={navLinkClasses}>
                  Admin
                </Link>
              )}
              <span className="hidden text-zinc-400 lg:inline">
                Signed in as {user.name}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-pink-200/70 px-4 py-1.5 font-medium text-pink-600 transition hover:bg-pink-50 dark:border-zinc-700 dark:text-pink-300 dark:hover:bg-zinc-900"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClasses}>
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-4 py-1.5 font-medium text-white shadow-sm shadow-pink-200 transition hover:from-pink-500 hover:to-rose-500 dark:shadow-none"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile nav: native disclosure widget, no client JS needed */}
        <details className="group relative sm:hidden">
          <summary
            className="flex h-9 w-9 list-none items-center justify-center rounded-full border border-pink-200/70 text-pink-600 [&::-webkit-details-marker]:hidden dark:border-zinc-700 dark:text-pink-300"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>

          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-pink-100/70 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            {user ? (
              <>
                <p className="px-3 pb-1 pt-2 text-xs text-zinc-400">
                  Signed in as {user.name}
                </p>
                <Link href="/profiles" className={mobileLinkClasses}>
                  Browse Profiles
                </Link>
                <Link href="/matches" className={mobileLinkClasses}>
                  My Matches
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className={mobileLinkClasses}>
                    Admin
                  </Link>
                )}
                <form action={logout} className="mt-1 border-t border-pink-100/70 pt-1 dark:border-zinc-800">
                  <button type="submit" className={`${mobileLinkClasses} w-full text-left text-pink-600 dark:text-pink-300`}>
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={mobileLinkClasses}>
                  Login
                </Link>
                <Link href="/register" className={`${mobileLinkClasses} text-pink-600 dark:text-pink-300`}>
                  Register
                </Link>
              </>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
