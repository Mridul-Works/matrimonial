import { toggleInterestAction } from "@/lib/actions/interests";
import HeartIcon from "@/components/HeartIcon";

export default function InterestButton({
  profileId,
  isInterested,
  redirectTo,
  size = "sm",
}: {
  profileId: string;
  isInterested: boolean;
  redirectTo: string;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "md" ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-xs";

  return (
    <form action={toggleInterestAction}>
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button
        type="submit"
        className={`inline-flex items-center gap-1.5 rounded-full font-medium transition ${sizeClasses} ${
          isInterested
            ? "bg-linear-to-r from-pink-400 to-rose-400 text-white shadow-sm shadow-pink-200 hover:from-pink-500 hover:to-rose-500 dark:shadow-none"
            : "border border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-zinc-700 dark:text-pink-300 dark:hover:bg-zinc-900"
        }`}
      >
        <HeartIcon className={size === "md" ? "h-4 w-4" : "h-3 w-3"} />
        {isInterested ? "Matched" : "Express Interest"}
      </button>
    </form>
  );
}
