"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import HeartIcon from "@/components/HeartIcon";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-pink-100/70 bg-white/80 p-8 shadow-sm shadow-pink-100/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-none">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-500 dark:text-pink-300">
          <HeartIcon className="h-3.5 w-3.5" />
          Begin your journey
        </span>
        <h1 className="mt-1 font-heading text-2xl text-zinc-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sign up to start browsing matrimonial profiles.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {state?.errors?.username && (
              <p className="mt-1 text-xs text-red-600">{state.errors.username[0]}</p>
            )}
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
              className="mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
            )}
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
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-pink-600 dark:text-pink-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
