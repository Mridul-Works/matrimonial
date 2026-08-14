import { toggleInterestAction } from "@/lib/actions/interests";
import HeartIcon from "@/components/HeartIcon";

export default function InterestButton({
  toUserId,
  isInterested,
  isMutual = false,
  redirectTo,
  size = "sm",
}: {
  toUserId: string;
  isInterested: boolean;
  /** Both sides have expressed interest — show it as a match, not just sent. */
  isMutual?: boolean;
  redirectTo: string;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "md" ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-xs";
  const iconClasses = size === "md" ? "h-4 w-4" : "h-3 w-3";

  const label = isMutual
    ? "It's a Match ✓"
    : isInterested
      ? "Interest Sent ✓"
      : "Express Interest";

  const styles = isMutual
    ? "bg-linear-to-r from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-200 hover:from-rose-600 hover:to-pink-700 dark:shadow-none"
    : isInterested
      ? "bg-linear-to-r from-pink-400 to-rose-400 text-white shadow-sm shadow-pink-200 hover:from-pink-500 hover:to-rose-500 dark:shadow-none"
      : "border border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-zinc-700 dark:text-pink-300 dark:hover:bg-zinc-900";

  return (
    <form action={toggleInterestAction}>
      <input type="hidden" name="toUserId" value={toUserId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button
        type="submit"
        title={isInterested ? "Click to withdraw your interest" : undefined}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium transition ${sizeClasses} ${styles}`}
      >
        <HeartIcon className={iconClasses} />
        {label}
      </button>
    </form>
  );
}
