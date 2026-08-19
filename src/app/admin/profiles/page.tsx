import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { calculateAge, formatDob, getProfiles } from "@/lib/data/profiles";
import { getAllInterests } from "@/lib/data/interests";
import { getAllUsers } from "@/lib/data/users";
import { AdminTable, IdBadge } from "@/components/admin/AdminTable";
import AdminSearch from "@/components/admin/AdminSearch";
import Pagination, { paginate } from "@/components/Pagination";

const PROFILES_PER_PAGE = 15;

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const { q, page: pageParam } = await searchParams;

  const [profiles, interests, users] = await Promise.all([
    getProfiles(),
    getAllInterests(),
    getAllUsers(),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));

  const receivedCount = new Map<string, number>();
  const sentCount = new Map<string, number>();
  for (const i of interests) {
    receivedCount.set(i.toUserId, (receivedCount.get(i.toUserId) ?? 0) + 1);
    sentCount.set(i.fromUserId, (sentCount.get(i.fromUserId) ?? 0) + 1);
  }

  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? profiles.filter((p) =>
        [p.codeNo, p.name, p.profession, p.city, userById.get(p.id)?.username ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : profiles;

  const { pageItems, page, totalPages, total, rangeStart, rangeEnd } = paginate(
    filtered,
    pageParam,
    PROFILES_PER_PAGE
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {totalPages > 1 ? (
            <>
              Showing {rangeStart}–{rangeEnd} of {total} profile
              {total === 1 ? "" : "s"}
              {needle ? ` matching “${q}”` : ""}.
            </>
          ) : (
            <>
              {total} profile{total === 1 ? "" : "s"}
              {needle ? ` matching “${q}”` : " listed"}.
            </>
          )}
        </p>
        <AdminSearch
          placeholder="Search by code, name, city..."
          defaultValue={q}
          clearHref="/admin/profiles"
        />
      </div>

      <div className="mt-4">
        <AdminTable
          columns={["Code No", "Name", "Username", "Gender", "Age", "City", "Profession", "Sent", "Received", "Added"]}
          rows={pageItems.map((p) => {
            const account = userById.get(p.id);
            return [
              <IdBadge key="code">{p.codeNo}</IdBadge>,
              <Link
                key="name"
                href={`/profiles/${p.id}`}
                className="font-medium text-pink-600 hover:underline dark:text-pink-300"
              >
                {p.name}
              </Link>,
              account ? (
                <IdBadge key="acct">{account.username}</IdBadge>
              ) : (
                <span key="acct" className="text-zinc-400">—</span>
              ),
              p.gender === "male" ? "Male" : "Female",
              <span key="age" className="tabular-nums">{calculateAge(p.dob)}</span>,
              p.city,
              p.profession,
              <span key="sent" className="tabular-nums">{sentCount.get(p.id) ?? 0}</span>,
              <span key="rec" className="tabular-nums">{receivedCount.get(p.id) ?? 0}</span>,
              formatDob(p.createdAt),
            ];
          })}
          emptyLabel={needle ? "No profiles match that search." : "No profiles yet."}
        />
      </div>

      <Pagination
        basePath="/admin/profiles"
        params={{ q }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
