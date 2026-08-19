import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { findUserById, type AppUser } from "@/lib/data/users";
import {
  calculateAge,
  formatDob,
  getProfileById,
  type MatrimonialProfile,
} from "@/lib/data/profiles";
import { getAllInterests } from "@/lib/data/interests";
import { IdBadge } from "@/components/admin/AdminTable";
import PhoneCell from "@/components/admin/PhoneCell";
import HeartIcon from "@/components/HeartIcon";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Admin-only side-by-side view of two members: the full biodata of both,
 * their phone numbers, and the interest status between them. Linked from
 * every mutual-match card and every row of the interest log.
 */
export default async function AdminPairPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  await requireAdmin();
  const { a, b } = await params;
  if (a === b) notFound();

  const [userA, userB, profileA, profileB, interests] = await Promise.all([
    findUserById(a),
    findUserById(b),
    getProfileById(a),
    getProfileById(b),
    getAllInterests(),
  ]);

  // Only member accounts have profiles; anything else is a bad URL.
  if (!userA || !userB || !profileA || !profileB) notFound();

  const aToB = interests.find((i) => i.fromUserId === a && i.toUserId === b);
  const bToA = interests.find((i) => i.fromUserId === b && i.toUserId === a);
  const isMutual = Boolean(aToB && bToA);
  const oneWay = aToB ?? bToA;

  return (
    <div>
      <Link
        href="/admin/matches"
        className="text-sm font-medium text-pink-600 dark:text-pink-300"
      >
        &larr; Back to match activity
      </Link>

      <h2 className="mt-3 font-heading text-xl text-zinc-900 dark:text-zinc-50">
        {profileA.name} &amp; {profileB.name}
      </h2>

      {isMutual ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border-2 border-pink-200 bg-linear-to-r from-pink-50/80 to-rose-50/60 px-4 py-3 text-sm text-rose-700 dark:border-pink-900/60 dark:from-pink-950/30 dark:to-zinc-900 dark:text-rose-300">
          <HeartIcon className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">It&apos;s a mutual match</span> — both
            sides said yes. Became mutual on{" "}
            {formatDateTime(
              aToB!.createdAt > bToA!.createdAt ? aToB!.createdAt : bToA!.createdAt
            )}
            .
          </span>
        </div>
      ) : oneWay ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <span className="font-semibold">One-way so far</span> —{" "}
          {(oneWay.fromUserId === a ? profileA : profileB).name} expressed interest
          in {(oneWay.fromUserId === a ? profileB : profileA).name} on{" "}
          {formatDateTime(oneWay.createdAt)}. No reply yet.
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No interest between these two members yet.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MemberCard user={userA} profile={profileA} sentAt={aToB?.createdAt} />
        <MemberCard user={userB} profile={profileB} sentAt={bToA?.createdAt} />
      </div>
    </div>
  );
}

function MemberCard({
  user,
  profile,
  sentAt,
}: {
  user: AppUser;
  profile: MatrimonialProfile;
  sentAt?: string;
}) {
  return (
    <div className="rounded-3xl border border-pink-100/70 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg text-zinc-900 dark:text-zinc-50">
            {profile.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <IdBadge>{profile.codeNo}</IdBadge>
            <span>@{user.username}</span>
            <IdBadge>{user.id}</IdBadge>
          </div>
        </div>
        <Link
          href={`/profiles/${profile.id}`}
          className="shrink-0 text-xs font-medium text-pink-600 hover:underline dark:text-pink-300"
        >
          Live profile &rarr;
        </Link>
      </div>

      <div className="mt-4 rounded-2xl border border-pink-100/70 bg-pink-50/40 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/50">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Phone (admin-only)
        </p>
        <div className="mt-1">
          <PhoneCell user={user} />
        </div>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label="Gender" value={profile.gender === "male" ? "Male" : "Female"} />
        <Row
          label="Date of birth"
          value={`${formatDob(profile.dob)} (${calculateAge(profile.dob)} years)`}
        />
        <Row label="Height" value={profile.heightLabel} />
        <Row label="City" value={profile.city} />
        <Row label="Profession" value={profile.profession} />
        <Row label="Work experience" value={profile.workExperience} />
        <Row label="Education" value={profile.education.join(", ")} />
        <Row
          label="Family"
          value={profile.family.map((f) => `${f.label}: ${f.value}`).join(" · ")}
        />
        <Row label="Partner preference" value={profile.partnerPreference} />
        <Row label="Joined" value={formatDob(user.createdAt)} />
        {sentAt && (
          <Row label="Sent interest on" value={formatDateTime(sentAt)} />
        )}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">{value}</dd>
    </div>
  );
}
