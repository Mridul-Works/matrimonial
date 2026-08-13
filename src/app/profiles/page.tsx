import { verifySession } from "@/lib/dal";
import { getProfiles } from "@/lib/data/profiles";
import { getInterestedProfileIds } from "@/lib/data/interests";
import ProfileCard from "@/components/ProfileCard";
import ProfileFilters, { type ProfileSearchParams } from "@/components/ProfileFilters";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<ProfileSearchParams>;
}) {
  const session = await verifySession();
  const params = await searchParams;

  const gender = params.gender === "male" || params.gender === "female" ? params.gender : undefined;
  const minAge = params.minAge ? Number(params.minAge) : undefined;
  const maxAge = params.maxAge ? Number(params.maxAge) : undefined;
  const sort =
    params.sort === "age-asc" || params.sort === "age-desc" ? params.sort : "newest";

  const [profiles, interestedIds] = await Promise.all([
    getProfiles({ q: params.q, gender, minAge, maxAge, sort }),
    getInterestedProfileIds(session.userId),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-2xl text-zinc-900 dark:text-zinc-50">
        Browse Profiles
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Use the filters below to find profiles relevant to what you&apos;re looking for.
      </p>

      <ProfileFilters params={params} />

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        {profiles.length} profile{profiles.length === 1 ? "" : "s"} found.
      </p>

      {profiles.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-pink-100/70 bg-white/70 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
          No profiles match your filters. Try widening your search.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isInterested={interestedIds.includes(profile.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
