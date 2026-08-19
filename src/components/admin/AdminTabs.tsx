"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/matches", label: "Match Activity" },
  { href: "/admin/profiles", label: "Profiles" },
  { href: "/admin/members", label: "Members" },
];

export default function AdminTabs({ pendingCalls = 0 }: { pendingCalls?: number }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-pink-100/70 dark:border-zinc-800">
      {TABS.map((tab) => {
        // "Profiles" must not light up for /admin/profiles/new (that's a form,
        // not the list) — but exact match keeps Overview from matching everything.
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              active
                ? "border-pink-500 text-pink-600 dark:border-pink-400 dark:text-pink-300"
                : "border-transparent text-zinc-500 hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-300"
            }`}
          >
            {tab.label}
            {tab.href === "/admin/members" && pendingCalls > 0 && (
              <span
                title={`${pendingCalls} confirmation call${
                  pendingCalls === 1 ? "" : "s"
                } waiting`}
                className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
              >
                {pendingCalls}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
