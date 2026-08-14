import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import {
  getMutualMatchUserIds,
  getReceivedInterestUserIds,
  getSentInterestUserIds,
} from "@/lib/data/interests";
import { getProfilesByIds } from "@/lib/data/profiles";
import ProfileCard from "@/components/ProfileCard";
import HeartIcon from "@/components/HeartIcon";

type Tab = "mutual" | "received" | "sent";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getUser();
  // Cookie is valid but the account is gone — clear it rather than loop.
  if (!user) redirect("/session-expired");
  // Admins don't participate in matching — their view of everyone's activity
  // lives in the console, not as a personal list.
  if (user.role === "admin") redirect("/admin/matches");

  const { tab: rawTab } = await searchParams;
  const tab: Tab =
    rawTab === "received" || rawTab === "sent" ? rawTab : "mutual";

  const [mutualIds, receivedIds, sentIds] = await Promise.all([
    getMutualMatchUserIds(user.id),
    getReceivedInterestUserIds(user.id),
    getSentInterestUserIds(user.id),
  ]);

  const mutualSet = new Set(mutualIds);
  // "Received" and "Sent" show only the not-yet-mutual ones — anything mutual
  // is promoted to the Matches tab, so nothing is listed twice.
  const pendingReceived = receivedIds.filter((id) => !mutualSet.has(id));
  const pendingSent = sentIds.filter((id) => !mutualSet.has(id));

  const activeIds =
    tab === "mutual" ? mutualIds : tab === "received" ? pendingReceived : pendingSent;
  const profiles = await getProfilesByIds(activeIds);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "mutual", label: "Matches", count: mutualIds.length },
    { key: "received", label: "Interests Received", count: pendingReceived.length },
    { key: "sent", label: "Interests Sent", count: pendingSent.length },
  ];

  const copy: Record<Tab, { title: string; blurb: string; empty: string }> = {
    mutual: {
      title: "Your Matches",
      blurb: "You and these members expressed interest in each other.",
      empty:
        "No matches yet. When someone you've sent an interest to sends one back, they'll appear here.",
    },
    received: {
      title: "Interests Received",
      blurb:
        "These members are interested in you. Send an interest back to turn it into a match.",
      empty: "Nobody has sent you an interest yet.",
    },
    sent: {
      title: "Interests Sent",
      blurb: "You've expressed interest in these members, awaiting their reply.",
      empty: "You haven't sent any interests yet.",
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-2xl text-zinc-900 dark:text-zinc-50">
        {copy[tab].title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{copy[tab].blurb}</p>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-pink-100/70 dark:border-zinc-800">
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <Link
              key={t.key}
              href={t.key === "mutual" ? "/matches" : `/matches?tab=${t.key}`}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-pink-500 text-pink-600 dark:border-pink-400 dark:text-pink-300"
                  : "border-transparent text-zinc-500 hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-300"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  active
                    ? "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {profiles.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-pink-100/70 bg-white/70 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
          <HeartIcon className="h-8 w-8 text-pink-300" />
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            {copy[tab].empty}
          </p>
          <Link
            href="/profiles"
            className="mt-2 rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-pink-200 transition hover:from-pink-500 hover:to-rose-500 dark:shadow-none"
          >
            Browse Profiles
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isInterested={tab !== "received"}
              isMutual={tab === "mutual"}
              hasInterestInYou={tab === "received"}
              redirectTo={tab === "mutual" ? "/matches" : `/matches?tab=${tab}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
