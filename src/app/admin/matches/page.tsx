import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getAllUsers } from "@/lib/data/users";
import { getProfiles, type MatrimonialProfile } from "@/lib/data/profiles";
import { findMutualMatches, getAllInterests } from "@/lib/data/interests";
import { AdminTable, IdBadge } from "@/components/admin/AdminTable";
import AdminSearch from "@/components/admin/AdminSearch";
import HeartIcon from "@/components/HeartIcon";
import type { AppUser } from "@/lib/data/users";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const [users, profiles, interests] = await Promise.all([
    getAllUsers(),
    getProfiles(),
    getAllInterests(),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const mutualMatches = findMutualMatches(interests, profiles);

  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? interests.filter((i) => {
        const member = userById.get(i.userId);
        const profile = profileById.get(i.profileId);
        return [
          member?.name,
          member?.username,
          member?.id,
          profile?.name,
          profile?.codeNo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
    : interests;

  return (
    <div>
      {/* ---- Mutual matches: both families liked each other ---- */}
      <section>
        <h2 className="flex items-center gap-2 font-heading text-lg text-zinc-900 dark:text-zinc-50">
          <HeartIcon className="h-4 w-4 text-pink-500" />
          Mutual Matches
          <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700 dark:bg-pink-950/50 dark:text-pink-300">
            {mutualMatches.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Pairs where each listing&apos;s managing member expressed interest in the
          other &mdash; both sides said yes. These are the families to call first.
        </p>

        {mutualMatches.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-pink-100/70 bg-white/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            No mutual matches yet. They appear when two listings&apos; members
            like each other&apos;s profiles.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {mutualMatches.map((match) => (
              <MutualMatchCard
                key={`${match.profileA.id}|${match.profileB.id}`}
                match={match}
                userById={userById}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---- Full one-directional interest log ---- */}
      <section className="mt-10">
        <h2 className="font-heading text-lg text-zinc-900 dark:text-zinc-50">
          All Interest Activity
        </h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {filtered.length} interest{filtered.length === 1 ? "" : "s"}
            {needle ? ` matching “${q}”` : " expressed in total"}. Newest first.
          </p>
          <AdminSearch
            placeholder="Search by member or profile..."
            defaultValue={q}
            clearHref="/admin/matches"
          />
        </div>

        <div className="mt-4">
          <AdminTable
            columns={["Member (ID)", "Expressed Interest In", "Profile Code", "When"]}
            rows={filtered.map((i) => {
              const member = userById.get(i.userId);
              const profile = profileById.get(i.profileId);
              return [
                <span key="m">
                  <span className="font-medium">{member?.name ?? "Deleted member"}</span>{" "}
                  {member && <IdBadge>{member.id}</IdBadge>}
                </span>,
                profile ? (
                  <Link
                    key="p"
                    href={`/profiles/${profile.id}`}
                    className="font-medium text-pink-600 hover:underline dark:text-pink-300"
                  >
                    {profile.name}
                  </Link>
                ) : (
                  "Removed profile"
                ),
                profile ? <IdBadge key="c">{profile.codeNo}</IdBadge> : "—",
                formatDateTime(i.createdAt),
              ];
            })}
            emptyLabel={
              needle ? "No match activity fits that search." : "No interests expressed yet."
            }
          />
        </div>
      </section>
    </div>
  );
}

function MutualMatchCard({
  match,
  userById,
}: {
  match: { profileA: MatrimonialProfile; profileB: MatrimonialProfile; matchedAt: string };
  userById: Map<string, AppUser>;
}) {
  return (
    <div className="rounded-2xl border-2 border-pink-200 bg-linear-to-r from-pink-50/80 to-rose-50/60 p-5 dark:border-pink-900/60 dark:from-pink-950/30 dark:to-zinc-900">
      <div className="flex items-center gap-3">
        <MatchSide profile={match.profileA} userById={userById} align="left" />
        <div className="flex shrink-0 flex-col items-center px-1 text-pink-500">
          <HeartIcon className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
            Mutual
          </span>
        </div>
        <MatchSide profile={match.profileB} userById={userById} align="right" />
      </div>
      <p className="mt-3 border-t border-pink-200/70 pt-2 text-center text-xs text-zinc-500 dark:border-pink-900/40 dark:text-zinc-400">
        Became mutual on {formatDateTime(match.matchedAt)}
      </p>
    </div>
  );
}

function MatchSide({
  profile,
  userById,
  align,
}: {
  profile: MatrimonialProfile;
  userById: Map<string, AppUser>;
  align: "left" | "right";
}) {
  const manager = profile.ownerUserId ? userById.get(profile.ownerUserId) : undefined;
  return (
    <div className={`min-w-0 flex-1 ${align === "right" ? "text-right" : ""}`}>
      <Link
        href={`/profiles/${profile.id}`}
        className="font-heading text-base text-zinc-900 hover:text-pink-600 dark:text-zinc-50 dark:hover:text-pink-300"
      >
        {profile.name}
      </Link>
      <div className={`mt-0.5 flex flex-wrap items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
        <IdBadge>{profile.codeNo}</IdBadge>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{profile.city}</span>
      </div>
      <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
        via {manager ? `${manager.name} (${manager.username})` : "unknown member"}
      </p>
    </div>
  );
}
