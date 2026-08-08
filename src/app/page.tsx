import Image from "next/image";
import Link from "next/link";
import { getOptionalSession } from "@/lib/dal";
import HeartIcon from "@/components/HeartIcon";

export default async function Home() {
  const session = await getOptionalSession();

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex h-screen w-full items-center overflow-hidden">
        <Image
          src="/images/hero-couple-jaipur.jpg"
          alt="Indian couple in traditional wedding attire at Patrika Gate, Jaipur"
          fill
          priority
          className="object-cover object-[77%_40%]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/20" />

        <div className="relative w-full px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <HeartIcon className="h-3.5 w-3.5 text-pink-300" />
            Trusted, family-first matchmaking
          </span>

          <h1 className="mx-auto mt-5 max-w-2xl font-heading text-4xl font-medium tracking-tight text-white sm:text-5xl">
            Find a <span className="italic text-pink-300">life partner</span>{" "}
            rooted in family &amp; tradition
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            Create a free account to view verified profiles with education,
            occupation, family background, and partner preference details —
            visible only to logged-in members.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {session ? (
              <Link
                href="/profiles"
                className="rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-6 py-3 text-sm font-medium text-white shadow-md shadow-black/20 transition hover:from-pink-500 hover:to-rose-500"
              >
                Browse Profiles
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-full bg-linear-to-r from-pink-400 to-rose-400 px-6 py-3 text-sm font-medium text-white shadow-md shadow-black/20 transition hover:from-pink-500 hover:to-rose-500"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-20">
        <dl className="grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <Feature title="Private &amp; Login-Only" description="Profiles are hidden from the public — only registered members can view details." />
          <Feature title="Complete Details" description="Education, occupation, family background, and partner preferences in one card." />
          <Feature title="Free to Join" description="No cost to register and browse — built as an open showcase." />
        </dl>
      </div>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-pink-100/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <dt className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        <HeartIcon className="h-3.5 w-3.5 text-pink-400" />
        {title}
      </dt>
      <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</dd>
    </div>
  );
}
