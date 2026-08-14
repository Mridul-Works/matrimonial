"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import HeartIcon from "@/components/HeartIcon";

const inputClasses =
  "mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900";

export default function LoginForm({ expired = false }: { expired?: boolean }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="rounded-3xl border border-pink-100/70 bg-white/80 p-8 shadow-sm shadow-pink-100/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-none">
      {expired && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Your previous session is no longer valid. Please sign in again.
        </p>
      )}

      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-500 dark:text-pink-300">
        <HeartIcon className="h-3.5 w-3.5" />
        Welcome back
      </span>
      <h1 className="mt-1 font-heading text-2xl text-zinc-900 dark:text-zinc-50">
        Log in to continue
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Browse matrimonial profiles curated with care.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            defaultValue="admin"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            defaultValue="admin"
            className={inputClasses}
          />
        </div>

        {state?.message && (
          <p className="text-sm text-red-600" role="alert">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-linear-to-r from-pink-400 to-rose-400 py-2.5 text-sm font-medium text-white shadow-sm shadow-pink-200 transition hover:from-pink-500 hover:to-rose-500 disabled:opacity-60 dark:shadow-none"
        >
          {pending ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        New here?{" "}
        <Link href="/register" className="font-medium text-pink-600 dark:text-pink-300">
          Create an account
        </Link>
      </p>

      <p className="mt-4 rounded-xl bg-pink-50/60 px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
        Demo login is pre-filled with <strong>admin</strong> / <strong>admin</strong>.
        Clear the boxes to sign in as a member, e.g.{" "}
        <strong>simran</strong> / <strong>simran123</strong>.
      </p>
    </div>
  );
}
