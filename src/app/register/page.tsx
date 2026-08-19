"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import HeartIcon from "@/components/HeartIcon";

const inputClasses =
  "mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900";
const labelClasses = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-pink-100/70 bg-white/80 p-6 shadow-sm shadow-pink-100/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-none sm:p-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-500 dark:text-pink-300">
          <HeartIcon className="h-3.5 w-3.5" />
          Begin your journey
        </span>
        <h1 className="mt-1 font-heading text-2xl text-zinc-900 dark:text-zinc-50">
          Create your profile
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your account and matrimonial profile are created together, so other
          members can discover you straight away. You can add the rest of your
          details later.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <Field
            label="Full name"
            name="name"
            placeholder="e.g. Ramesh Sain"
            errors={state?.errors?.name}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Username"
              name="username"
              placeholder="e.g. ramesh"
              errors={state?.errors?.username}
            />
            <Field
              label="Password"
              name="password"
              type="password"
              errors={state?.errors?.password}
            />
          </div>

          <div>
            <Field
              label="Mobile number"
              name="phone"
              type="tel"
              placeholder="e.g. 98765 43210"
              errors={state?.errors?.phone}
            />
            <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <p>
                <span className="font-semibold">We will call you to confirm this number.</span>{" "}
                Our team verifies every new member with a short phone call, which can
                take up to 48 hours after you register.
              </p>
              <p className="mt-1 text-amber-700/90 dark:text-amber-300/80">
                Your number stays private — it is never shown to other members and is
                visible only to our team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClasses} htmlFor="gender">
                Gender
              </label>
              <select id="gender" name="gender" className={inputClasses} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {state?.errors?.gender && (
                <p className="mt-1 text-xs text-red-600">{state.errors.gender[0]}</p>
              )}
            </div>
            <Field
              label="Date of birth"
              name="dob"
              type="date"
              errors={state?.errors?.dob}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="City"
              name="city"
              placeholder="e.g. Ludhiana"
              errors={state?.errors?.city}
            />
            <Field
              label="Profession"
              name="profession"
              placeholder="e.g. Teacher"
              errors={state?.errors?.profession}
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
            {pending ? "Creating your profile..." : "Create profile"}
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

function Field({
  label,
  name,
  type = "text",
  placeholder,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  errors?: string[];
}) {
  return (
    <div>
      <label className={labelClasses} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={inputClasses}
      />
      {errors && <p className="mt-1 text-xs text-red-600">{errors[0]}</p>}
    </div>
  );
}
