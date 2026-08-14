import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { calculateAge, formatDob, getProfileById } from "@/lib/data/profiles";
import { hasSentInterest } from "@/lib/data/interests";
import Avatar from "@/components/Avatar";
import HeartIcon from "@/components/HeartIcon";
import InterestButton from "@/components/InterestButton";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  // Cookie is valid but the account is gone — clear it rather than loop.
  if (!user) redirect("/session-expired");
  const isAdmin = user.role === "admin";
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  const isOwnProfile = profile.id === user.id;
  const [iSent, theySent] = isAdmin
    ? [false, false]
    : await Promise.all([
        hasSentInterest(user.id, profile.id),
        hasSentInterest(profile.id, user.id),
      ]);
  const isMutual = iSent && theySent;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/profiles" className="text-sm font-medium text-pink-600 dark:text-pink-300">
        &larr; Back to all profiles
      </Link>

      <div className="mt-6 rounded-3xl border border-pink-100/70 bg-white/90 p-8 shadow-sm shadow-pink-100/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-none">
        {isMutual && (
          <p className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-rose-100 to-pink-100 px-4 py-3 text-sm font-semibold text-rose-700 dark:from-rose-950/50 dark:to-pink-950/50 dark:text-rose-300">
            <HeartIcon className="h-4 w-4" />
            It&apos;s a match — you both expressed interest in each other.
          </p>
        )}
        {!isMutual && theySent && !isAdmin && (
          <p className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <HeartIcon className="h-4 w-4" />
            {profile.name.split(" ")[0]} has expressed interest in you.
          </p>
        )}

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar name={profile.name} photoUrl={profile.photoUrl} size={112} />
          <div className="flex-1">
            <span className="inline-block rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
              Code No: {profile.codeNo}
            </span>
            <h1 className="mt-1 font-heading text-2xl text-zinc-900 dark:text-zinc-50">
              {profile.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {calculateAge(profile.dob)} years old &bull; {profile.heightLabel}
            </p>
            {isOwnProfile ? (
              <Link
                href="/my-profile"
                className="mt-4 inline-block rounded-full border border-pink-200 px-5 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-zinc-700 dark:text-pink-300 dark:hover:bg-zinc-900"
              >
                This is you — edit your profile
              </Link>
            ) : (
              !isAdmin && (
                <div className="mt-4 flex justify-center sm:justify-start">
                  <InterestButton
                    toUserId={profile.id}
                    isInterested={iSent}
                    isMutual={isMutual}
                    redirectTo={`/profiles/${profile.id}`}
                    size="md"
                  />
                </div>
              )
            )}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Date of Birth" value={formatDob(profile.dob)} />
          <Field label="Height" value={profile.heightLabel} />
          <Field label="City" value={profile.city} />
          <Field label="Profession" value={profile.profession} />
          <Field label="Work Experience" value={profile.workExperience} />
        </dl>

        <Section title="Educational Qualification">
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {profile.education.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>

        <Section title="Family Details">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {profile.family.map((item) => (
              <div key={item.label}>
                <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {item.label}
                </dt>
                <dd className="text-sm text-zinc-800 dark:text-zinc-200">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Partner Preference">
          <p className="rounded-2xl bg-pink-50/70 p-4 text-sm italic leading-relaxed text-pink-900 dark:bg-pink-950/20 dark:text-pink-200">
            {profile.partnerPreference}
          </p>
        </Section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-pink-100/70 pt-6 dark:border-zinc-800">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-pink-500/80 dark:text-pink-300/80">
        <HeartIcon className="h-3 w-3" />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
