import Link from "next/link";

export default function AdminSearch({
  placeholder,
  defaultValue,
  clearHref,
  hidden,
}: {
  placeholder: string;
  defaultValue?: string;
  clearHref: string;
  // Query params the search submit must carry along (e.g. filter=pending) —
  // a GET form replaces the whole query string, so anything not in a field
  // would be dropped. Deliberately excludes `page`: a new search restarts
  // at page 1.
  hidden?: Record<string, string>;
}) {
  return (
    <form className="flex flex-wrap items-center gap-2">
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input
        type="text"
        name="q"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full min-w-0 rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900 sm:w-72"
      />
      <button
        type="submit"
        className="rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-pink-200 transition hover:from-pink-500 hover:to-rose-500 dark:shadow-none"
      >
        Search
      </button>
      {defaultValue && (
        <Link
          href={clearHref}
          className="rounded-full border border-pink-200 px-4 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-zinc-700 dark:text-pink-300 dark:hover:bg-zinc-900"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
