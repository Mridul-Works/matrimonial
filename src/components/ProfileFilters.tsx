import Link from "next/link";

export type ProfileSearchParams = {
  q?: string;
  gender?: string;
  minAge?: string;
  maxAge?: string;
};

export default function ProfileFilters({ params }: { params: ProfileSearchParams }) {
  const hasFilters = Boolean(params.q || params.gender || params.minAge || params.maxAge);

  return (
    <form className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-pink-100/70 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:grid-cols-5">
      <input
        type="text"
        name="q"
        placeholder="Name, profession, education..."
        defaultValue={params.q}
        className="rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
      />
      <select
        name="gender"
        defaultValue={params.gender ?? ""}
        className="rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">Any gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input
        type="number"
        name="minAge"
        placeholder="Min age"
        min={18}
        defaultValue={params.minAge}
        className="rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        type="number"
        name="maxAge"
        placeholder="Max age"
        min={18}
        defaultValue={params.maxAge}
        className="rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900"
      />

      <div className="flex gap-2 sm:col-span-5">
        <button
          type="submit"
          className="rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-pink-200 transition hover:from-pink-500 hover:to-rose-500 dark:shadow-none"
        >
          Search
        </button>
        {hasFilters && (
          <Link
            href="/profiles"
            className="rounded-full border border-pink-200 px-5 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-zinc-700 dark:text-pink-300 dark:hover:bg-zinc-900"
          >
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
