import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getAllUsers, type AppUser } from "@/lib/data/users";
import { getProfiles, type MatrimonialProfile } from "@/lib/data/profiles";
import { findMutualPairs, getAllInterests } from "@/lib/data/interests";
import { AdminTable, IdBadge } from "@/components/admin/AdminTable";
import AdminSearch from "@/components/admin/AdminSearch";
import HeartIcon from "@/components/HeartIcon";
import Pagination, { paginate } from "@/components/Pagination";

const INTERESTS_PER_PAGE = 15;

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
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const { q, page: pageParam } = await searchParams;

  const [users, profiles, interests] = await Promise.all([
    getAllUsers(),
    getProfiles(),
    getAllInterests(),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const mutualPairs = findMutualPairs(interests);

  // Which interests are reciprocated — so the log can flag them.
  const sentKeys = new Set(interests.map((i) => `${i.fromUserId}->${i.toUserId}`));

  const label = (id: string) =>
    `${userById.get(id)?.name ?? ""} ${userById.get(id)?.username ?? ""} ${
      profileById.get(id)?.codeNo ?? ""
    } ${id}`;

  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? interests.filter((i) =>
        `${label(i.fromUserId)} ${label(i.toUserId)}`.toLowerCase().includes(needle)
      )
    : interests;

  const { pageItems, page, totalPages, total, rangeStart, rangeEnd } = paginate(
    filtered,
    pageParam,
    INTERESTS_PER_PAGE
  );

  return (
    <div>
      <section>
        <h2 className="flex items-center gap-2 font-heading text-lg text-zinc-900 dark:text-zinc-50">
          <HeartIcon className="h-4 w-4 text-pink-500" />
          Mutual Matches
          <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700 dark:bg-pink-950/50 dark:text-pink-300">
            {mutualPairs.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Pairs where both members expressed interest in each other &mdash; both
          sides said yes. These are the families to call first.
        </p>

        {mutualPairs.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-pink-100/70 bg-white/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            No mutual matches yet.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {mutualPairs.map((pair) => (
              // The whole card opens the pair-detail page (full biodata of
              // both sides plus phone numbers), so the sides inside are
              // plain text — no nested links.
              <Link
                key={`${pair.userIdA}|${pair.userIdB}`}
                href={`/admin/matches/${pair.userIdA}/${pair.userIdB}`}
                className="block rounded-2xl border-2 border-pink-200 bg-linear-to-r from-pink-50/80 to-rose-50/60 p-5 transition hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/60 dark:border-pink-900/60 dark:from-pink-950/30 dark:to-zinc-900 dark:hover:border-pink-800 dark:hover:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <MatchSide
                    profile={profileById.get(pair.userIdA)}
                    user={userById.get(pair.userIdA)}
                    align="left"
                  />
                  <div className="flex shrink-0 flex-col items-center px-1 text-pink-500">
                    <HeartIcon className="h-5 w-5" />
                    <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      Mutual
                    </span>
                  </div>
                  <MatchSide
                    profile={profileById.get(pair.userIdB)}
                    user={userById.get(pair.userIdB)}
                    align="right"
                  />
                </div>
                <p className="mt-3 border-t border-pink-200/70 pt-2 text-center text-xs text-zinc-500 dark:border-pink-900/40 dark:text-zinc-400">
                  Became mutual on {formatDateTime(pair.matchedAt)} &middot;{" "}
                  <span className="font-medium text-pink-600 dark:text-pink-300">
                    Open pair details &rarr;
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-lg text-zinc-900 dark:text-zinc-50">
          All Interest Activity
        </h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {totalPages > 1 ? (
              <>
                Showing {rangeStart}–{rangeEnd} of {total} interest
                {total === 1 ? "" : "s"}
                {needle ? ` matching “${q}”` : ""}. Newest first.
              </>
            ) : (
              <>
                {total} interest{total === 1 ? "" : "s"}
                {needle ? ` matching “${q}”` : " sent in total"}. Newest first.
              </>
            )}
          </p>
          <AdminSearch
            placeholder="Search by either member..."
            defaultValue={q}
            clearHref="/admin/matches"
          />
        </div>

        <div className="mt-4">
          <AdminTable
            columns={["From (member)", "To (member)", "Status", "When", "Details"]}
            rows={pageItems.map((i) => {
              const from = userById.get(i.fromUserId);
              const to = userById.get(i.toUserId);
              const toProfile = profileById.get(i.toUserId);
              const reciprocated = sentKeys.has(`${i.toUserId}->${i.fromUserId}`);
              return [
                <PersonCell
                  key="f"
                  user={from}
                  profile={profileById.get(i.fromUserId)}
                />,
                <PersonCell key="t" user={to} profile={toProfile} />,
                reciprocated ? (
                  <span
                    key="s"
                    className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                  >
                    <HeartIcon className="h-3 w-3" />
                    Mutual
                  </span>
                ) : (
                  <span
                    key="s"
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    One-way
                  </span>
                ),
                formatDateTime(i.createdAt),
                <Link
                  key="d"
                  href={`/admin/matches/${i.fromUserId}/${i.toUserId}`}
                  className="whitespace-nowrap text-xs font-medium text-pink-600 hover:underline dark:text-pink-300"
                >
                  View pair &rarr;
                </Link>,
              ];
            })}
            emptyLabel={
              needle ? "No match activity fits that search." : "No interests sent yet."
            }
          />
        </div>

        <Pagination
          basePath="/admin/matches"
          params={{ q }}
          page={page}
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}

function PersonCell({
  user,
  profile,
}: {
  user?: AppUser;
  profile?: MatrimonialProfile;
}) {
  if (!user) return <span className="text-zinc-400">Deleted member</span>;
  return (
    <span>
      {profile ? (
        <Link
          href={`/profiles/${profile.id}`}
          className="font-medium text-pink-600 hover:underline dark:text-pink-300"
        >
          {user.name}
        </Link>
      ) : (
        <span className="font-medium">{user.name}</span>
      )}{" "}
      <IdBadge>{profile?.codeNo ?? user.username}</IdBadge>
    </span>
  );
}

function MatchSide({
  profile,
  user,
  align,
}: {
  profile?: MatrimonialProfile;
  user?: AppUser;
  align: "left" | "right";
}) {
  if (!profile || !user) {
    return <div className="min-w-0 flex-1 text-zinc-400">Unknown member</div>;
  }
  return (
    <div className={`min-w-0 flex-1 ${align === "right" ? "text-right" : ""}`}>
      <span className="font-heading text-base text-zinc-900 dark:text-zinc-50">
        {profile.name}
      </span>
      <div
        className={`mt-0.5 flex flex-wrap items-center gap-1.5 ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <IdBadge>{profile.codeNo}</IdBadge>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{profile.city}</span>
      </div>
      <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
        @{user.username}
      </p>
    </div>
  );
}
