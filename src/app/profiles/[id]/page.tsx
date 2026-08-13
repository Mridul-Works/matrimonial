import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { calculateAge, formatDob, getProfileById } from "@/lib/data/profiles";
import { isInterested } from "@/lib/data/interests";
import Avatar from "@/components/Avatar";
import HeartIcon from "@/components/HeartIcon";
import InterestButton from "@/components/InterestButton";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile) {
    notFound();
  }

  const interested = await isInterested(session.userId, profile.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/profiles" className="text-sm font-medium text-pink-600 dark:text-pink-300">
        &larr; Back to all profiles
      </Link>

      <div className="mt-6 rounded-3xl border border-pink-100/70 bg-white/90 p-8 shadow-sm shadow-pink-100/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-none">
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
            <div className="mt-4 flex justify-center sm:justify-start">
              <InterestButton
                profileId={profile.id}
                isInterested={interested}
                redirectTo={`/profiles/${profile.id}`}
                size="md"
              />
            </div>
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
