import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { getProfileByUserId } from "@/lib/data/profiles";
import MyProfileForm from "@/components/MyProfileForm";
import HeartIcon from "@/components/HeartIcon";

export default async function MyProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await getUser();
  // Cookie is valid but the account is gone — clear it rather than loop.
  if (!user) redirect("/session-expired");
  if (user.role === "admin") redirect("/admin");

  const profile = await getProfileByUserId(user.id);
  if (!profile) redirect("/profiles");

  const { welcome } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {welcome && (
        <p className="mb-6 flex items-start gap-2 rounded-2xl bg-linear-to-r from-pink-100 to-rose-100 px-4 py-3 text-sm text-rose-800 dark:from-pink-950/50 dark:to-rose-950/50 dark:text-rose-200">
          <HeartIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Welcome! Your profile is live and other members can already find you.
            Fill in the rest below to get better matches.
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
            Code No: {profile.codeNo}
          </span>
          <h1 className="mt-1 font-heading text-2xl text-zinc-900 dark:text-zinc-50">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            This is what other members see when they find you.
          </p>
        </div>
        <Link
          href={`/profiles/${profile.id}`}
          className="rounded-full border border-pink-200 px-4 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-zinc-700 dark:text-pink-300 dark:hover:bg-zinc-900"
        >
          View as others see it
        </Link>
      </div>

      <MyProfileForm profile={profile} />
    </div>
  );
}
