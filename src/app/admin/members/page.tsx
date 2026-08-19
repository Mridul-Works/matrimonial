import { requireAdmin } from "@/lib/dal";
import { getAllUsers } from "@/lib/data/users";
import { getAllInterests } from "@/lib/data/interests";
import { formatDob } from "@/lib/data/profiles";
import { AdminTable, IdBadge } from "@/components/admin/AdminTable";
import AdminSearch from "@/components/admin/AdminSearch";
import PhoneCell from "@/components/admin/PhoneCell";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const [users, interests] = await Promise.all([getAllUsers(), getAllInterests()]);

  const sentCount = new Map<string, number>();
  const receivedCount = new Map<string, number>();
  for (const i of interests) {
    sentCount.set(i.fromUserId, (sentCount.get(i.fromUserId) ?? 0) + 1);
    receivedCount.set(i.toUserId, (receivedCount.get(i.toUserId) ?? 0) + 1);
  }

  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? users.filter((u) =>
        [u.id, u.name, u.username, u.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : users;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {filtered.length} account{filtered.length === 1 ? "" : "s"}
          {needle ? ` matching “${q}”` : " registered"}.
        </p>
        <AdminSearch
          placeholder="Search by ID, name, username, phone..."
          defaultValue={q}
          clearHref="/admin/members"
        />
      </div>

      <div className="mt-4">
        <AdminTable
          columns={["ID", "Name", "Username", "Phone", "Role", "Sent", "Received", "Joined"]}
          rows={filtered.map((u) => [
            <IdBadge key="id">{u.id}</IdBadge>,
            u.name,
            u.username,
            u.phone ? (
              <PhoneCell key="phone" user={u} />
            ) : (
              <span key="phone" className="text-xs text-zinc-400 dark:text-zinc-500">
                —
              </span>
            ),
            u.role === "admin" ? (
              <span
                key="role"
                className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              >
                admin
              </span>
            ) : (
              <span
                key="role"
                className="rounded-full bg-pink-50 px-2 py-0.5 text-xs font-semibold text-pink-600 dark:bg-pink-950/40 dark:text-pink-300"
              >
                member
              </span>
            ),
            <span key="sent" className="tabular-nums">{sentCount.get(u.id) ?? 0}</span>,
            <span key="recv" className="tabular-nums">{receivedCount.get(u.id) ?? 0}</span>,
            formatDob(u.createdAt),
          ])}
          emptyLabel={needle ? "No accounts match that search." : "No accounts yet."}
        />
      </div>
    </div>
  );
}
