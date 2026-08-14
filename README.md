# Sain Smajh Matrimonial

A login-gated matrimonial web app built for the Sain Samaj community, offered
with the blessings of Baba Sain Bhagat Ji.

Members browse curated biodata profiles and express interest; an admin manages
the catalogue and can see exactly who tried to match with whom.

> **Status: frontend complete.** Everything works end to end, but data is stored
> in JSON files rather than a real database. The data layer is deliberately
> isolated so a backend can be dropped in without touching any page or
> component — see [Swapping in a real backend](#swapping-in-a-real-backend).

---

## Quick start

```bash
npm install
npm run dev
```

Then open **http://localhost:3311**.

> `npm run dev` is pinned to `next dev --webpack -p 3311`. The `--webpack` flag
> matters: Turbopack (Next's default) crashes with a worker-spawn error on some
> Windows setups. The fixed port avoids clashing with other local projects.

### Demo accounts

| Username | Password    | Role   | What they see                          |
| -------- | ----------- | ------ | -------------------------------------- |
| `admin`  | `admin`     | admin  | Everything, plus the admin console      |
| `ravi`   | `ravi123`   | member | Member area only                        |
| `pooja`  | `pooja123`  | member | Member area only                        |
| `harish` | `harish123` | member | Member area only                        |

The seed data ships with 9 profiles and 5 pre-recorded interests, so both the
member area and the admin match log have something meaningful to show on first
run.

### Other commands

```bash
npm run build     # production build
npm start         # serve the production build
npm run lint      # eslint
npx tsc --noEmit  # type-check
```

---

## User flows

Step-by-step walkthroughs live in two plain-text files next to this README:

- **[USER_FLOW.txt](./USER_FLOW.txt)** — the member journey: register, search,
  view a profile, express interest, review matches.
- **[ADMIN_FLOW.txt](./ADMIN_FLOW.txt)** — the admin journey: log in, read the
  overview, audit match activity, look people up by ID, add a profile.

---

## Routes

| Route                  | Access | Purpose                                                            |
| ---------------------- | ------ | ------------------------------------------------------------------ |
| `/`                    | public | Landing page — full-height hero, what the service is                |
| `/login`               | public | Sign in (redirects to `/profiles` if already signed in)             |
| `/register`            | public | Create a member account                                             |
| `/profiles`            | member | Browse with search, gender/age filters, and sorting                 |
| `/profiles/[id]`       | member | Full biodata + express-interest button                              |
| `/matches`             | member | Profiles this member expressed interest in                          |
| `/admin`               | admin  | Overview — counts and latest match activity                         |
| `/admin/matches`       | admin  | Full log of who expressed interest in whom, searchable              |
| `/admin/members`       | admin  | Every account by ID, with role and interests-sent count             |
| `/admin/profiles`      | admin  | Every listing by code number, with interests-received count         |
| `/admin/profiles/new`  | admin  | Add a profile                                                       |

---

## Project structure

```
src/
├── proxy.ts                  Route gate (Next 16's renamed middleware)
├── app/
│   ├── layout.tsx            Fonts, header, footer, page background
│   ├── page.tsx              Public landing page
│   ├── login/ · register/    Auth forms (Server Actions)
│   ├── profiles/             Member area — listing, detail
│   ├── matches/              Member's own interest list
│   └── admin/
│       ├── layout.tsx        Admin shell with tab navigation
│       ├── page.tsx          Overview
│       ├── matches/ members/ profiles/    Admin tables
│       └── profiles/new/     Add-profile form
├── lib/
│   ├── session.ts            JWT sign/verify, cookie handling
│   ├── dal.ts                verifySession · getUser · requireAdmin
│   ├── actions/              "use server" mutations
│   └── data/                 ← the only place that touches storage
│       ├── store.ts          JSON read/write helpers
│       ├── users.ts · profiles.ts · interests.ts
└── components/               Header, footer, cards, filters, admin tables
```

---

## How it's built

**Framework** — Next.js 16 App Router with React Server Components. Pages render
on the server; every mutation is a Server Action posted from a plain `<form>`,
so the app works with JavaScript disabled.

**Auth** — hand-rolled credentials auth, no paid vendor. Passwords are bcrypt
hashed; sessions are 7-day HS256 JWTs (via `jose`) in an `httpOnly` cookie.

**Two-layer route protection** — every request passes two independent checks:

1. `proxy.ts` runs at the edge of the app and only decrypts the cookie — cheap
   enough to run on every request. Anonymous visitors to a protected route get
   redirected to `/login`.
2. The page itself calls the DAL (`verifySession()`, or `requireAdmin()` for
   admin routes). This is the real gate — it re-verifies the token and looks up
   the user's role.

Server Actions re-run their own check rather than trusting the proxy, so
mutations stay safe even if a route slips past the matcher.

**Styling** — Tailwind CSS v4. Playfair Display for headings, Geist for body
text, with a pink/rose palette. Fully responsive with a `<details>`-based mobile
menu (no client JS), and dark mode throughout.

---

## Swapping in a real backend

Every read and write in the app goes through four files in `src/lib/data/`.
Nothing above that layer — no page, no component, no action — knows that storage
is JSON files.

To move to a real database (Postgres via Prisma, Supabase, Vercel Postgres, …):

1. Keep the exported function signatures in `users.ts`, `profiles.ts`, and
   `interests.ts` exactly as they are — they're already `async` and already
   return plain objects.
2. Replace each function body with a real query.
3. Delete `store.ts`.

No other file needs to change. The three tables map directly to the existing
types: `AppUser`, `MatrimonialProfile`, and `Interest`.

---

## Known constraints

These are deliberate trade-offs for a frontend-stage build, not bugs:

- **Data isn't durable in production.** The JSON store writes to the OS temp
  directory, because serverless platforms like Vercel ship a read-only
  filesystem. On a deployed instance, data can reset on a cold start and isn't
  shared between concurrent instances. A real database fixes this.
- **No photos yet.** Profiles show a coloured initials avatar. The
  `photoUrl` field already exists on the profile type, so wiring up uploads
  later needs no schema change.
- **Interest is one-directional.** A member expresses interest in a profile;
  there's no mutual-match handshake, because profiles aren't user accounts.
- **Admin can add but not edit or delete profiles.** The next obvious feature.
- **Demo credentials are printed on the login page.** Remove that hint before
  real users arrive.
- **`SESSION_SECRET` falls back to a baked-in dev value** if the environment
  variable is missing, so builds never fail for the lack of it. Set a real one
  (`openssl rand -base64 32`) in your host's environment settings before
  launch — sessions signed with the fallback are forgeable.

---

## Deployment

Pushes to `main` deploy from
[github.com/Mridul-Works/matrimonial](https://github.com/Mridul-Works/matrimonial).

Set `SESSION_SECRET` in the host's environment variables before going live.
