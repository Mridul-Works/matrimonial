import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getAllUsers } from "@/lib/data/users";
import { calculateAge, formatDob, getProfiles } from "@/lib/data/profiles";
import { getAllInterests } from "@/lib/data/interests";
import HeartIcon from "@/components/HeartIcon";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [users, profiles, interests] = await Promise.all([
    getAllUsers(),
    getProfiles(),
    getAllInterests(),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-6 py-12">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-500 dark:text-pink-300">
        <HeartIcon className="h-3.5 w-3.5" />
        Signed in as {admin.name}
      </span>
      <h1 className="mt-1 font-heading text-2xl text-zinc-900 dark:text-zinc-50">
        Admin Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        A full overview of members, profiles, and match activity.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Registered members" value={users.length} />
        <StatCard label="Profiles listed" value={profiles.length} />
        <StatCard label="Matches expressed" value={interests.length} />
      </div>

      <Section
        title="Profiles"
        action={
          <Link
            href="/admin/profiles/new"
            className="rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-4 py-1.5 text-xs font-medium text-white shadow-sm shadow-pink-200 transition hover:from-pink-500 hover:to-rose-500 dark:shadow-none"
          >
            + Add Profile
          </Link>
        }
      >
        <Table
          columns={["Code No", "Name", "Gender", "Age", "Profession", "Added"]}
          rows={profiles.map((p) => [
            p.codeNo,
            p.name,
            p.gender === "male" ? "Male" : "Female",
            String(calculateAge(p.dob)),
            p.profession,
            formatDob(p.createdAt),
          ])}
          emptyLabel="No profiles yet."
        />
      </Section>

      <Section title="Registered Members">
        <Table
          columns={["Name", "Username", "Role", "Joined"]}
          rows={users.map((u) => [u.name, u.username, u.role, formatDob(u.createdAt)])}
          emptyLabel="No members yet."
        />
      </Section>

      <Section title="Recent Match Activity">
        <Table
          columns={["Member", "Profile", "Expressed On"]}
          rows={interests.map((i) => [
            userById.get(i.userId)?.name ?? "Unknown",
            profileById.get(i.profileId)?.name ?? "Unknown",
            formatDob(i.createdAt),
          ])}
          emptyLabel="No matches expressed yet."
        />
      </Section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-pink-100/70 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-3xl font-semibold text-pink-600 dark:text-pink-300">{value}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-zinc-900 dark:text-zinc-50">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Table({
  columns,
  rows,
  emptyLabel,
}: {
  columns: string[];
  rows: string[][];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-pink-100/70 bg-white/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-pink-100/70 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full min-w-125 text-left text-sm">
        <thead>
          <tr className="border-b border-pink-100/70 dark:border-zinc-800">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-pink-50 last:border-0 dark:border-zinc-800/60"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
