import Link from "next/link";

export type ProfileSearchParams = {
  q?: string;
  gender?: string;
  minAge?: string;
  maxAge?: string;
  sort?: string;
  // Handled by the page, not this form — a fresh search submit drops it,
  // which is exactly right: new filters restart at page 1.
  page?: string;
};

const inputClasses =
  "rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900";

export default function ProfileFilters({ params }: { params: ProfileSearchParams }) {
  const hasFilters = Boolean(
    params.q || params.gender || params.minAge || params.maxAge || params.sort
  );

  return (
    <form className="mt-6 rounded-2xl border border-pink-100/70 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
        <input
          type="text"
          name="q"
          placeholder="Search name, profession, city, or managing member..."
          defaultValue={params.q}
          className={`${inputClasses} sm:col-span-3`}
        />
        <select name="gender" defaultValue={params.gender ?? ""} className={inputClasses}>
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
          className={inputClasses}
        />
        <input
          type="number"
          name="maxAge"
          placeholder="Max age"
          min={18}
          defaultValue={params.maxAge}
          className={inputClasses}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
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
        <label className="ml-auto flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          Sort by
          <select name="sort" defaultValue={params.sort ?? "newest"} className={inputClasses}>
            <option value="newest">Newest first</option>
            <option value="age-asc">Age: low to high</option>
            <option value="age-desc">Age: high to low</option>
          </select>
        </label>
      </div>
    </form>
  );
}
