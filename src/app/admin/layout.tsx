import Link from "next/link";
import HeartIcon from "@/components/HeartIcon";
import AdminTabs from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-500 dark:text-pink-300">
            <HeartIcon className="h-3.5 w-3.5" />
            Admin Panel
          </span>
          <h1 className="mt-1 font-heading text-2xl text-zinc-900 dark:text-zinc-50">
            Sain Smajh Console
          </h1>
        </div>
        <Link
          href="/admin/profiles/new"
          className="mt-3 inline-block self-start rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-pink-200 transition hover:from-pink-500 hover:to-rose-500 dark:shadow-none sm:mt-0"
        >
          + Register Member
        </Link>
      </div>

      <AdminTabs />

      <div className="mt-6 min-w-0">{children}</div>
    </div>
  );
}
