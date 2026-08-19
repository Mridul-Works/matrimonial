import Link from "next/link";
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
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  await requireAdmin();
  const { q, filter } = await searchParams;
  const pendingOnly = filter === "pending";

  const [users, interests] = await Promise.all([getAllUsers(), getAllInterests()]);

  const sentCount = new Map<string, number>();
  const receivedCount = new Map<string, number>();
  for (const i of interests) {
    sentCount.set(i.fromUserId, (sentCount.get(i.fromUserId) ?? 0) + 1);
    receivedCount.set(i.toUserId, (receivedCount.get(i.toUserId) ?? 0) + 1);
  }

  const isPendingCall = (u: (typeof users)[number]) =>
    Boolean(u.phone) && !u.phoneVerified;
  const pendingTotal = users.filter(isPendingCall).length;

  const needle = q?.trim().toLowerCase();
  let filtered = needle
    ? users.filter((u) =>
        [u.id, u.name, u.username, u.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : users;

  if (pendingOnly) {
    // The call queue: oldest signup first, so the 48-hour promise is
    // honoured in the order people registered.
    filtered = filtered
      .filter(isPendingCall)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const filterChip = (active: boolean) =>
    active
      ? "rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white"
      : "rounded-full border border-pink-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-pink-300 hover:text-pink-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-pink-300";

  const withQuery = (base: string) => (q ? `${base}${base.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}` : base);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link href={withQuery("/admin/members")} className={filterChip(!pendingOnly)}>
            All accounts
          </Link>
          <Link
            href={withQuery("/admin/members?filter=pending")}
            className={filterChip(pendingOnly)}
          >
            Call pending ({pendingTotal})
          </Link>
        </div>
        <AdminSearch
          placeholder="Search by ID, name, username, phone..."
          defaultValue={q}
          clearHref={pendingOnly ? "/admin/members?filter=pending" : "/admin/members"}
        />
      </div>

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        {pendingOnly ? (
          <>
            {filtered.length} confirmation call{filtered.length === 1 ? "" : "s"}{" "}
            waiting{needle ? ` matching “${q}”` : ""}. Oldest first — registration
            promises the call within 48 hours.
          </>
        ) : (
          <>
            {filtered.length} account{filtered.length === 1 ? "" : "s"}
            {needle ? ` matching “${q}”` : " registered"}.
          </>
        )}
      </p>

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
          emptyLabel={
            pendingOnly
              ? needle
                ? "No pending calls match that search."
                : "No calls pending — all caught up."
              : needle
                ? "No accounts match that search."
                : "No accounts yet."
          }
        />
      </div>
    </div>
  );
}
