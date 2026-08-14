"use client";

import { useActionState } from "react";
import { updateMyProfileAction } from "@/lib/actions/profile";
import type { MatrimonialProfile } from "@/lib/data/profiles";

const inputClasses =
  "mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-900";
const labelClasses = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

/** Seeded/placeholder values shouldn't be pre-filled as if the user typed them. */
function real(value: string): string {
  return value === "Not specified" ? "" : value;
}

export default function MyProfileForm({ profile }: { profile: MatrimonialProfile }) {
  const [state, formAction, pending] = useActionState(updateMyProfileAction, undefined);

  const brother =
    profile.family.find((f) => f.label === "Brother")?.value ?? "0";
  const sister = profile.family.find((f) => f.label === "Sister")?.value ?? "0";
  const education = profile.education.filter((e) => e !== "Not specified").join("\n");

  return (
    <form
      action={formAction}
      className="mt-6 space-y-4 rounded-3xl border border-pink-100/70 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/80"
    >
      {state?.saved && (
        <p className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300">
          Profile saved.
        </p>
      )}

      <Field label="Full name" name="name" defaultValue={profile.name} errors={state?.errors?.name} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClasses} htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            className={inputClasses}
            defaultValue={profile.gender}
          >
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
          defaultValue={profile.dob}
          errors={state?.errors?.dob}
        />
        <Field
          label="Height"
          name="heightLabel"
          placeholder={`e.g. 5'9" (175 cm)`}
          defaultValue={real(profile.heightLabel)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="City" name="city" defaultValue={profile.city} errors={state?.errors?.city} />
        <Field
          label="Profession"
          name="profession"
          defaultValue={profile.profession}
          errors={state?.errors?.profession}
        />
      </div>

      <div>
        <label className={labelClasses} htmlFor="education">
          Educational qualification (one per line)
        </label>
        <textarea
          id="education"
          name="education"
          rows={3}
          className={inputClasses}
          defaultValue={education}
          placeholder={"B.Tech (Computer Science)\nSenior Secondary (+2)"}
        />
      </div>

      <div>
        <label className={labelClasses} htmlFor="workExperience">
          Work experience
        </label>
        <textarea
          id="workExperience"
          name="workExperience"
          rows={2}
          className={inputClasses}
          defaultValue={real(profile.workExperience)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Brother(s)" name="brother" defaultValue={brother} placeholder="e.g. 1 (Married)" />
        <Field label="Sister(s)" name="sister" defaultValue={sister} placeholder="e.g. 0" />
      </div>

      <div>
        <label className={labelClasses} htmlFor="partnerPreference">
          Partner preference
        </label>
        <textarea
          id="partnerPreference"
          name="partnerPreference"
          rows={3}
          className={inputClasses}
          defaultValue={real(profile.partnerPreference)}
          placeholder="Describe the kind of partner and family you're hoping for."
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
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className={inputClasses}
      />
      {errors && <p className="mt-1 text-xs text-red-600">{errors[0]}</p>}
    </div>
  );
}
