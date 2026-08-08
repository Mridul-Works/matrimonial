import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getInterestedProfileIds } from "@/lib/data/interests";
import { getProfileById, type MatrimonialProfile } from "@/lib/data/profiles";
import ProfileCard from "@/components/ProfileCard";
import HeartIcon from "@/components/HeartIcon";

export default async function MatchesPage() {
  const session = await verifySession();
  const ids = await getInterestedProfileIds(session.userId);
  const profiles = (await Promise.all(ids.map((id) => getProfileById(id)))).filter(
    (profile): profile is MatrimonialProfile => Boolean(profile)
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-2xl text-zinc-900 dark:text-zinc-50">
        My Matches
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Profiles you&apos;ve expressed interest in.
      </p>

      {profiles.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-pink-100/70 bg-white/70 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
          <HeartIcon className="h-8 w-8 text-pink-300" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You haven&apos;t matched with any profiles yet.
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
              isInterested
              redirectTo="/matches"
            />
          ))}
        </div>
      )}
    </div>
  );
}
