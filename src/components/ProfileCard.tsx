import Link from "next/link";
import Avatar from "@/components/Avatar";
import InterestButton from "@/components/InterestButton";
import {
  calculateAge,
  type MatrimonialProfile,
} from "@/lib/data/profiles";

export default function ProfileCard({
  profile,
  isInterested = false,
  redirectTo = "/profiles",
}: {
  profile: MatrimonialProfile;
  isInterested?: boolean;
  redirectTo?: string;
}) {
  return (
    <div className="group flex flex-col rounded-3xl border border-pink-100/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100 dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:shadow-none">
      <Link href={`/profiles/${profile.id}`} className="flex flex-1 flex-col">
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} photoUrl={profile.photoUrl} size={72} />
          <div>
            <span className="inline-block rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
              Code No: {profile.codeNo}
            </span>
            <h3 className="mt-1 font-heading text-lg text-zinc-900 dark:text-zinc-50">
              {profile.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {calculateAge(profile.dob)} yrs &bull; {profile.heightLabel}
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

      <div className="mt-4 border-t border-pink-100/70 pt-4 dark:border-zinc-800">
        <InterestButton
          profileId={profile.id}
          isInterested={isInterested}
          redirectTo={redirectTo}
        />
      </div>
    </div>
  );
}
