import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getAllUsers } from "@/lib/data/users";
import { getProfiles } from "@/lib/data/profiles";
import { getAllInterests } from "@/lib/data/interests";
import { AdminTable, IdBadge } from "@/components/admin/AdminTable";
import AdminSearch from "@/components/admin/AdminSearch";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const [users, profiles, interests] = await Promise.all([
    getAllUsers(),
    getProfiles(),
    getAllInterests(),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? interests.filter((i) => {
        const member = userById.get(i.userId);
        const profile = profileById.get(i.profileId);
        return [
          member?.name,
          member?.username,
          member?.id,
          profile?.name,
          profile?.codeNo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
    : interests;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {filtered.length} interest{filtered.length === 1 ? "" : "s"}
          {needle ? ` matching “${q}”` : " expressed in total"}. Newest first.
        </p>
        <AdminSearch
          placeholder="Search by member or profile..."
          defaultValue={q}
          clearHref="/admin/matches"
        />
      </div>

      <div className="mt-4">
        <AdminTable
          columns={["Member (ID)", "Expressed Interest In", "Profile Code", "When"]}
          rows={filtered.map((i) => {
            const member = userById.get(i.userId);
            const profile = profileById.get(i.profileId);
            return [
              <span key="m">
                <span className="font-medium">{member?.name ?? "Deleted member"}</span>{" "}
                {member && <IdBadge>{member.id}</IdBadge>}
              </span>,
              profile ? (
                <Link
                  key="p"
                  href={`/profiles/${profile.id}`}
                  className="font-medium text-pink-600 hover:underline dark:text-pink-300"
                >
                  {profile.name}
                </Link>
              ) : (
                "Removed profile"
              ),
              profile ? <IdBadge key="c">{profile.codeNo}</IdBadge> : "—",
              formatDateTime(i.createdAt),
            ];
          })}
          emptyLabel={
            needle ? "No match activity fits that search." : "No interests expressed yet."
          }
        />
      </div>
    </div>
  );
}
