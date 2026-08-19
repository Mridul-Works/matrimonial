import type { AppUser } from "@/lib/data/users";
import { formatIndianMobile } from "@/lib/phone";
import { setPhoneVerifiedAction } from "@/lib/actions/admin";

/**
 * Admin-only phone display: the number plus its verification chip. The chip
 * is a button that records the confirmation call (or reverts a misclick).
 * Never render this in member-facing pages — numbers are admin-only.
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
    </div>
  );
}
