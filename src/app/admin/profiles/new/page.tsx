"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProfileAction } from "@/lib/actions/admin";

const inputClasses =
  "mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900";
const labelClasses = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function NewProfilePage() {
  const [state, formAction, pending] = useActionState(createProfileAction, undefined);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/profiles" className="text-sm font-medium text-pink-600 dark:text-pink-300">
        &larr; Back to profiles
      </Link>

      <h2 className="mt-3 font-heading text-xl text-zinc-900 dark:text-zinc-50">
        Add a Profile
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Photos aren&apos;t supported yet — profiles show an initials avatar until that
        ships.
      </p>

      <form
        action={formAction}
        className="mt-6 space-y-4 rounded-3xl border border-pink-100/70 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/80"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Code No" name="codeNo" placeholder="e.g. 51/26" errors={state?.errors?.codeNo} />
          <Field label="Full Name" name="name" errors={state?.errors?.name} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClasses} htmlFor="gender">Gender</label>
            <select id="gender" name="gender" className={inputClasses} defaultValue="">
              <option value="" disabled>Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {state?.errors?.gender && (
              <p className="mt-1 text-xs text-red-600">{state.errors.gender[0]}</p>
            )}
          </div>
          <Field label="Date of Birth" name="dob" type="date" errors={state?.errors?.dob} />
          <Field
            label="Height"
            name="heightLabel"
            placeholder={`e.g. 5'9" (175 cm)`}
            errors={state?.errors?.heightLabel}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City" name="city" placeholder="e.g. Ludhiana" errors={state?.errors?.city} />
          <Field label="Profession" name="profession" errors={state?.errors?.profession} />
        </div>

        <div>
          <label className={labelClasses} htmlFor="education">
            Educational Qualification (one per line)
          </label>
          <textarea
            id="education"
            name="education"
            rows={3}
            className={inputClasses}
            placeholder={"B.Tech (Computer Science)\nSenior Secondary (+2)"}
          />
        </div>

        <div>
          <label className={labelClasses} htmlFor="workExperience">Work Experience</label>
          <textarea id="workExperience" name="workExperience" rows={2} className={inputClasses} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Brother(s)" name="brother" placeholder="e.g. 1 (Married)" />
          <Field label="Sister(s)" name="sister" placeholder="e.g. 0" />
        </div>

        <div>
          <label className={labelClasses} htmlFor="partnerPreference">Partner Preference</label>
          <textarea id="partnerPreference" name="partnerPreference" rows={3} className={inputClasses} />
        </div>

        <div>
          <Field
            label="Managed by (member username, optional)"
            name="managedBy"
            placeholder="e.g. ravi"
            errors={state?.errors?.managedBy}
          />
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Link this listing to the member who manages it. Mutual matches can
            only be detected for linked listings.
          </p>
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
          {pending ? "Adding profile..." : "Add Profile"}
        </button>
      </form>
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
