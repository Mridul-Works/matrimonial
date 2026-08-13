export function AdminTable({
  columns,
  rows,
  emptyLabel,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-pink-100/70 bg-white/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-pink-100/70 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full min-w-125 text-left text-sm">
        <thead>
          <tr className="border-b border-pink-100/70 dark:border-zinc-800">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-pink-50 last:border-0 dark:border-zinc-800/60"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IdBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-pink-50 px-1.5 py-0.5 font-mono text-xs text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
      {children}
    </span>
  );
}
