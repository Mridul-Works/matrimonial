import Link from "next/link";
import Avatar from "@/components/Avatar";
import InterestButton from "@/components/InterestButton";
import HeartIcon from "@/components/HeartIcon";
import { calculateAge, type MatrimonialProfile } from "@/lib/data/profiles";

export default function ProfileCard({
  profile,
  isInterested = false,
  isMutual = false,
  hasInterestInYou = false,
  redirectTo = "/profiles",
  showInterest = true,
}: {
  profile: MatrimonialProfile;
  /** Current user has expressed interest in this person. */
  isInterested?: boolean;
  /** Interest goes both ways. */
  isMutual?: boolean;
  /** This person expressed interest in the current user (not yet reciprocated). */
  hasInterestInYou?: boolean;
  redirectTo?: string;
  /** Admins browse read-only — no interest button for them. */
  showInterest?: boolean;
}) {
  return (
    <div
      className={`group flex flex-col rounded-3xl border bg-white/90 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100 dark:bg-zinc-900/90 dark:hover:shadow-none ${
        isMutual
          ? "border-rose-300 dark:border-rose-800"
          : "border-pink-100/70 hover:border-pink-200 dark:border-zinc-800"
      }`}
    >
      {(isMutual || hasInterestInYou) && (
        <span
          className={`mb-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isMutual
              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
          }`}
        >
          <HeartIcon className="h-3 w-3" />
          {isMutual ? "It's a match" : "Interested in you"}
        </span>
      )}

      <Link href={`/profiles/${profile.id}`} className="flex flex-1 flex-col">
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} photoUrl={profile.photoUrl} size={72} />
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
              Code No: {profile.codeNo}
            </span>
            <h3 className="mt-1 truncate font-heading text-lg text-zinc-900 dark:text-zinc-50">
              {profile.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {calculateAge(profile.dob)} yrs &bull; {profile.heightLabel}
            </p>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {profile.city}
            </p>
          </div>
        </div>

        <dl className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-900 dark:text-zinc-100">Education:</dt>
            <dd className="truncate">{profile.education.join(", ")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-900 dark:text-zinc-100">Profession:</dt>
            <dd className="truncate">{profile.profession}</dd>
          </div>
        </dl>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pink-500 group-hover:underline dark:text-pink-300">
          View full profile &rarr;
        </span>
      </Link>

      {showInterest && (
        <div className="mt-4 border-t border-pink-100/70 pt-4 dark:border-zinc-800">
          <InterestButton
            toUserId={profile.id}
            isInterested={isInterested}
            isMutual={isMutual}
            redirectTo={redirectTo}
          />
        </div>
      )}
    </div>
  );
}
