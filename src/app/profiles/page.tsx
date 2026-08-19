import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { getProfiles } from "@/lib/data/profiles";
import {
  getReceivedInterestUserIds,
  getSentInterestUserIds,
} from "@/lib/data/interests";
import ProfileCard from "@/components/ProfileCard";
import ProfileFilters, { type ProfileSearchParams } from "@/components/ProfileFilters";
import Pagination, { paginate } from "@/components/Pagination";

// Two full rows on the 3-column desktop grid, and an even count on the
// 2-column tablet grid too.
const PROFILES_PER_PAGE = 12;

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<ProfileSearchParams>;
}) {
  const user = await getUser();
  // Cookie is valid but the account is gone — clear it rather than loop.
  if (!user) redirect("/session-expired");
  const isAdmin = user.role === "admin";
  const params = await searchParams;

  const gender =
    params.gender === "male" || params.gender === "female" ? params.gender : undefined;
  const minAge = params.minAge ? Number(params.minAge) : undefined;
  const maxAge = params.maxAge ? Number(params.maxAge) : undefined;
  const sort =
    params.sort === "age-asc" || params.sort === "age-desc" ? params.sort : "newest";

  const [profiles, sentIds, receivedIds] = await Promise.all([
    getProfiles({
      q: params.q,
      gender,
      minAge,
      maxAge,
      sort,
      // Members never see themselves in the browse list.
      excludeUserId: isAdmin ? undefined : user.id,
    }),
    isAdmin ? Promise.resolve([]) : getSentInterestUserIds(user.id),
    isAdmin ? Promise.resolve([]) : getReceivedInterestUserIds(user.id),
  ]);

  const sent = new Set(sentIds);
  const received = new Set(receivedIds);

  const { pageItems, page, totalPages, total, rangeStart, rangeEnd } = paginate(
    profiles,
    params.page,
    PROFILES_PER_PAGE
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-2xl text-zinc-900 dark:text-zinc-50">
        Browse Profiles
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {isAdmin
          ? "Every member profile, as members see it. Admins browse read-only."
          : "Find someone who fits what you're looking for, and send them an interest."}
      </p>

      <ProfileFilters params={params} />

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        {total === 0
          ? "0 profiles found."
          : totalPages > 1
            ? `Showing ${rangeStart}–${rangeEnd} of ${total} profiles.`
            : `${total} profile${total === 1 ? "" : "s"} found.`}
      </p>

      {total === 0 ? (
        <p className="mt-8 rounded-2xl border border-pink-100/70 bg-white/70 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
          No profiles match your filters. Try widening your search.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((profile) => {
            const iSent = sent.has(profile.id);
            const theySent = received.has(profile.id);
            return (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isInterested={iSent}
                isMutual={iSent && theySent}
                hasInterestInYou={theySent && !iSent}
                showInterest={!isAdmin}
              />
            );
          })}
        </div>
      )}

      <Pagination
        basePath="/profiles"
        params={{
          q: params.q,
          gender,
          minAge: params.minAge,
          maxAge: params.maxAge,
          sort: params.sort,
        }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
