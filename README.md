# Sain Smajh Matrimonial

A login-gated matrimonial web app built for the Sain Samaj community, offered
with the blessings of Baba Sain Bhagat Ji.

Members browse curated biodata profiles and express interest; an admin manages
the catalogue and can see exactly who tried to match with whom.

> **Status: full stack.** Everything works end to end on a real SQLite
> database (Node's built-in `node:sqlite` — zero extra dependencies), stored
> durably at `data/matrimonial.db`. The data layer is still deliberately
> isolated, so moving to a hosted database later touches nothing above it —
> see [Moving to a hosted database](#moving-to-a-hosted-database).

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

### How the model works

**Everyone except the admin is a member, and every member *is* a profile.**
Members browse each other, send interests, and receive them; when two members
have each sent the other an interest, that pair becomes a **match**.

The admin is a pure overseer: no profile, no interests, cannot participate —
only observe everyone's activity and register members.

### Demo accounts

All member passwords follow the pattern `<username>123`.

| Username   | Password      | Profile              | Notable state                    |
| ---------- | ------------- | -------------------- | -------------------------------- |
| `admin`    | `admin`       | —                    | Admin console only               |
| `simran`   | `simran123`   | Simran Kaur, 17/26   | 1 match, 1 interest received     |
| `sarbjeet` | `sarbjeet123` | Sarbjeet Singh, 42/26| 1 match (with Simran)            |
| `vikram`   | `vikram123`   | Vikram Sain, 77/26   | 1 match (with Anjali)            |
| `anjali`   | `anjali123`   | Anjali Sain, 61/26   | 1 match (with Vikram)            |
| `priya`    | `priya123`    | Priya Verma, 23/26   | 1 sent, 1 received — no match yet|
| `aman`     | `aman123`     | Aman Sharma, 08/26   | 1 interest received              |
| `rahul`    | `rahul123`    | Rahul Nagpal, 56/26  | 1 sent, 1 received               |
| `neha`     | `neha123`     | Neha Kumari, 12/26   | 1 interest sent                  |
| `gurpreet` | `gurpreet123` | Gurpreet Singh, 31/26| 1 interest sent                  |

The seed ships with 9 members and 8 interests forming **2 mutual matches**
(Sarbjeet ↔ Simran, Vikram ↔ Anjali) plus several one-way interests, so every
state — match, received, sent, nothing — is visible on first run.

Log in as `simran` to see all three at once: a match with Sarbjeet, an
unreciprocated interest received from Rahul, and the rest of the members to
browse.

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
| `/login`               | public | Sign in (members → `/profiles`, admin → `/admin`)                   |
| `/register`            | public | Create an account *and* its profile in one step                     |
| `/profiles`            | member | Browse everyone else, with search, filters, and sorting             |
| `/profiles/[id]`       | member | Full biodata + express-interest button                              |
| `/matches`             | member | Three tabs: Matches (mutual), Interests Received, Interests Sent    |
| `/my-profile`          | member | View and edit your own biodata                                      |
| `/admin`               | admin  | Overview — counts and latest activity                               |
| `/admin/matches`       | admin  | Mutual matches, plus the full who-liked-whom log                    |
| `/admin/members`       | admin  | Every account by ID, with sent/received counts                      |
| `/admin/profiles`      | admin  | Every profile by code number, linked to its account                 |
| `/admin/profiles/new`  | admin  | Register a member (walk-in): creates their login + profile          |

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
│       ├── db.ts             SQLite connection, schema, first-run seeding
│       ├── seed-data.ts      Demo users/profiles/interests
│       ├── users.ts · profiles.ts · interests.ts   SQL queries
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

## The database

Storage is SQLite through Node's built-in `node:sqlite` module — no ORM, no
native npm packages. The database file lives at `data/matrimonial.db`
(gitignored) in WAL mode, with three tables — `users`, `profiles`,
`interests` — matching the exported types 1:1.

On the very first run, `db.ts` seeds the demo data — or, if the retired JSON
store's files still exist in the OS temp dir, migrates those instead so
accounts registered before the switch carry over. Delete `data/` to reset to
a fresh seed.

## Moving to a hosted database

Every read and write still goes through `users.ts`, `profiles.ts`, and
`interests.ts` in `src/lib/data/` — nothing above that layer knows SQLite is
underneath. To move to Postgres/Turso/Supabase (needed for serverless hosts,
see below): keep the exported function signatures, swap each SQL call's
client, and port the schema in `db.ts`. The queries are plain SQL already.

---

## Known constraints

These are deliberate trade-offs for a frontend-stage build, not bugs:

- **SQLite needs a persistent disk.** Data is durable on any machine or VPS
  that keeps its filesystem (the file sits in `data/`). Serverless platforms
  like Vercel do NOT — deploying there means swapping the SQLite connection
  for a hosted database first (see above). `node:sqlite` is marked
  experimental in Node 22 (prints a startup warning; API is stable enough in
  practice).
- **No photos yet.** Profiles show a coloured initials avatar. The
  `photoUrl` field already exists on the profile type, so wiring up uploads
  later needs no schema change.
- **No messaging.** Matched members can see each other, but there's no chat or
  contact exchange yet — the next obvious feature.
- **No notifications.** A member finds out about a new interest by visiting
  their Matches page; nothing emails or alerts them.
- **Admin can register but not edit or delete members.**
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
