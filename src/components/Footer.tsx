import Image from "next/image";
import Link from "next/link";
import HeartIcon from "@/components/HeartIcon";

export default function Footer() {
  return (
    <footer className="border-t border-pink-100/70 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
        <Image
          src="/images/baba.jpeg"
          alt="Baba Sain Bhagat Ji"
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full border-2 border-pink-200 object-cover dark:border-pink-900"
        />
        <div>
          <p className="flex items-center justify-center gap-1.5 font-heading text-sm text-pink-600 dark:text-pink-300 sm:justify-start">
            <HeartIcon className="h-3.5 w-3.5" />
            With the blessings of Baba Sain Bhagat Ji
          </p>
          <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
            Sain Smajh Matrimonial is offered freely as a service to the Sain
            Samaj — helping families of our community find suitable,
            God-blessed matches rooted in faith, tradition, and trust. No
            fees, no advertisements — only sewa.
          </p>
        </div>
      </div>

      <div className="border-t border-pink-100/70 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-zinc-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Sain Smajh Matrimonial. A community service.</p>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-pink-600 dark:hover:text-pink-300">
              Home
            </Link>
            <Link href="/profiles" className="hover:text-pink-600 dark:hover:text-pink-300">
              Browse Profiles
            </Link>
            <Link href="/register" className="hover:text-pink-600 dark:hover:text-pink-300">
              Join
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
