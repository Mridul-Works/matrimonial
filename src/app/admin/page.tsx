import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getAllUsers } from "@/lib/data/users";
import { getProfiles } from "@/lib/data/profiles";
import { getAllInterests } from "@/lib/data/interests";
import { IdBadge } from "@/components/admin/AdminTable";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [users, profiles, interests] = await Promise.all([
    getAllUsers(),
    getProfiles(),
    getAllInterests(),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const members = users.filter((u) => u.role === "member");
  const recent = interests.slice(0, 6);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Registered members" value={members.length} href="/admin/members" />
        <StatCard label="Profiles listed" value={profiles.length} href="/admin/profiles" />
        <StatCard label="Interests expressed" value={interests.length} href="/admin/matches" />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg text-zinc-900 dark:text-zinc-50">
            Latest Match Activity
          </h2>
          <Link
            href="/admin/matches"
            className="text-sm font-medium text-pink-600 hover:underline dark:text-pink-300"
          >
            View all &rarr;
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-pink-100/70 bg-white/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            No interests expressed yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-pink-50 rounded-2xl border border-pink-100/70 bg-white dark:divide-zinc-800/60 dark:border-zinc-800 dark:bg-zinc-900">
            {recent.map((interest) => {
              const member = userById.get(interest.userId);
              const profile = profileById.get(interest.profileId);
              return (
                <li key={interest.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-sm">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {member?.name ?? "Deleted member"}
                  </span>
                  <span className="text-pink-400">&hearts;</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {profile?.name ?? "Removed profile"}
                  </span>
                  {profile && <IdBadge>{profile.codeNo}</IdBadge>}
                  <span className="ml-auto text-xs text-zinc-400">
                    {formatDateTime(interest.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-pink-100/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <p className="text-3xl font-semibold text-pink-600 tabular-nums dark:text-pink-300">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </Link>
  );
}
