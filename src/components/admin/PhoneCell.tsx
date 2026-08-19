import type { AppUser } from "@/lib/data/users";
import { formatIndianMobile } from "@/lib/phone";
import { saveCallNoteAction, setPhoneVerifiedAction } from "@/lib/actions/admin";

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Admin-only phone display: the number, its verification chip, when it was
 * verified, and a scratch note about the confirmation call. The chip is a
 * button that records the call (or reverts a misclick). Never render this
 * in member-facing pages — numbers and notes are admin-only.
 */
export default function PhoneCell({ user }: { user: AppUser }) {
  if (!user.phone) {
    return (
      <span className="text-xs text-zinc-400 dark:text-zinc-500">
        No number on record
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="whitespace-nowrap font-mono text-xs">
        {formatIndianMobile(user.phone)}
      </div>
      <form action={setPhoneVerifiedAction}>
        <input type="hidden" name="userId" value={user.id} />
        <input
          type="hidden"
          name="verified"
          value={user.phoneVerified ? "false" : "true"}
        />
        <button
          type="submit"
          title={
            user.phoneVerified
              ? "Click to move back to call pending"
              : "Click once the confirmation call is done"
          }
          className={
            user.phoneVerified
              ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
              : "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
          }
        >
          {user.phoneVerified ? "Verified ✓" : "Call pending"}
        </button>
      </form>
      {user.phoneVerified && user.phoneVerifiedAt && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          Verified on {formatShortDate(user.phoneVerifiedAt)}
        </p>
      )}
      <form action={saveCallNoteAction} className="flex items-center gap-1">
        <input type="hidden" name="userId" value={user.id} />
        <input
          name="note"
          defaultValue={user.callNote ?? ""}
          placeholder="Call note..."
          title="Note to yourself about the call, e.g. didn't pick up, retry Tuesday. Save empty to clear."
          className="w-32 rounded-lg border border-pink-100 bg-white/70 px-1.5 py-0.5 text-xs placeholder:text-zinc-400 focus:border-pink-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded-md px-1 py-0.5 text-[10px] font-semibold text-pink-600 hover:bg-pink-50 dark:text-pink-300 dark:hover:bg-pink-950/40"
        >
          Save
        </button>
      </form>
    </div>
  );
}
