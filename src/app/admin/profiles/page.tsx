import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { calculateAge, formatDob, getProfiles } from "@/lib/data/profiles";
import { getAllInterests } from "@/lib/data/interests";
import { AdminTable, IdBadge } from "@/components/admin/AdminTable";
import AdminSearch from "@/components/admin/AdminSearch";

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const [profiles, interests] = await Promise.all([getProfiles(), getAllInterests()]);

  const receivedCount = new Map<string, number>();
  for (const interest of interests) {
    receivedCount.set(
      interest.profileId,
      (receivedCount.get(interest.profileId) ?? 0) + 1
    );
  }

  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? profiles.filter((p) =>
        [p.codeNo, p.name, p.profession, p.city].join(" ").toLowerCase().includes(needle)
      )
    : profiles;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {filtered.length} profile{filtered.length === 1 ? "" : "s"}
          {needle ? ` matching “${q}”` : " listed"}.
        </p>
        <AdminSearch
          placeholder="Search by code, name, city..."
          defaultValue={q}
          clearHref="/admin/profiles"
        />
      </div>

      <div className="mt-4">
        <AdminTable
          columns={["Code No", "Name", "Gender", "Age", "City", "Profession", "Interests Received", "Added"]}
          rows={filtered.map((p) => [
            <IdBadge key="code">{p.codeNo}</IdBadge>,
            <Link
              key="name"
              href={`/profiles/${p.id}`}
              className="font-medium text-pink-600 hover:underline dark:text-pink-300"
            >
              {p.name}
            </Link>,
            p.gender === "male" ? "Male" : "Female",
            <span key="age" className="tabular-nums">{calculateAge(p.dob)}</span>,
            p.city,
            p.profession,
            <span key="rec" className="tabular-nums">{receivedCount.get(p.id) ?? 0}</span>,
            formatDob(p.createdAt),
          ])}
          emptyLabel={needle ? "No profiles match that search." : "No profiles yet."}
        />
      </div>
    </div>
  );
}
