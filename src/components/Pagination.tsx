import Link from "next/link";

/**
 * Slice a full result list down to one page. The store loads everything
 * into memory anyway, so pages paginate after filtering; when a real
 * database arrives this moves into the query (LIMIT/OFFSET) and the
 * component below stays as it is.
 */
export function paginate<T>(
  items: T[],
  rawPage: string | undefined,
  perPage: number
): {
  pageItems: T[];
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
} {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const requested = Number(rawPage);
  // A bad or out-of-range ?page= clamps rather than 404s — filters change
  // result counts and stale bookmarks shouldn't break.
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(1, Math.trunc(requested)), totalPages)
    : 1;
  const start = (page - 1) * perPage;
  return {
    pageItems: items.slice(start, start + perPage),
    page,
    totalPages,
    total,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + perPage, total),
  };
}

/**
 * Numbered pager driven entirely by the URL, so pages stay bookmarkable
 * like the rest of the filters. `params` are the other query params to
 * preserve (q, gender, ...); page 1 keeps a clean URL with no ?page=.
 */
export default function Pagination({
  basePath,
  params = {},
  page,
  totalPages,
}: {
  basePath: string;
  params?: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // 1 … page-1 page page+1 … last — always first and last, a window of
  // one around the current page, ellipsis for the gaps.
  const numbers: (number | "gap")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      numbers.push(p);
    } else if (numbers[numbers.length - 1] !== "gap") {
      numbers.push("gap");
    }
  }

  const linkClasses =
    "rounded-full border border-pink-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:border-pink-300 hover:text-pink-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-pink-300";
  const activeClasses =
    "rounded-full bg-pink-500 px-3 py-1.5 text-sm font-semibold text-white";
  const disabledClasses =
    "rounded-full border border-pink-100 px-3 py-1.5 text-sm font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600";

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClasses}>
          &larr; Prev
        </Link>
      ) : (
        <span className={disabledClasses}>&larr; Prev</span>
      )}

      {numbers.map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-zinc-400">
            &hellip;
          </span>
        ) : n === page ? (
          <span key={n} aria-current="page" className={activeClasses}>
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)} className={linkClasses}>
            {n}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClasses}>
          Next &rarr;
        </Link>
      ) : (
        <span className={disabledClasses}>Next &rarr;</span>
      )}
    </nav>
  );
}
