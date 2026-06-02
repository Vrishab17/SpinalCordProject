# ISNCSCI Spinal Cord Assessment (prototype)

Web app for capturing and reviewing **ISNCSCI / ASIA** spinal cord assessments. Built with **Next.js** and **Supabase (PostgreSQL)**.

This README is written for **project handover** — setup, database, and where to look in the codebase.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (comes with Node)
- A **Supabase** project (free tier is fine for development)

---

## Quick start

### 1. Install dependencies

```bash
cd spinal-cord-assessment
npm install
```

### 2. Connect Supabase

Copy the environment template and add your project keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Project Settings** → **API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → **anon** / **publishable** key |

Never commit `.env.local`. Do not put the **service role** key in `NEXT_PUBLIC_*` variables.

### 3. Database

Choose **one** path:

**A — New empty database (full schema)**

1. Open Supabase → **SQL Editor**.
2. Run the full script: [`supabase/schema.sql`](supabase/schema.sql).
3. Optionally add dev rows: [`supabase/seed.example.sql`](supabase/seed.example.sql) (edit placeholders first).

**B — Match an existing production DB (migrations)**

If the database already has tables and you only need the **LLNN assessment ID** change:

```bash
# With Supabase CLI linked to your project:
supabase db push
```

Or run manually: [`supabase/migrations/20260521234028_assessment_id_llnn_format.sql`](supabase/migrations/20260521234028_assessment_id_llnn_format.sql).

**Assessment IDs** are four characters: **two uppercase letters + two digits** (e.g. `BK01`). The app generates them; the column is `char(4)` with a check constraint.

### 4. Staff login

Login uses `Staff` + `Staff Credentials` (bcrypt password hash), not Supabase Auth.

1. Insert a staff row and credentials (see `supabase/seed.example.sql`), **or**
2. Use your existing data and ensure `password_hash` is bcrypt.

To hash plain-text passwords already in the DB (one-off dev helper):

```http
POST /api/hash-existing-passwords
```

(Create credentials via SQL only on non-production environments.)

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to **Login** → **Dashboard** after sign-in.

Other scripts:

```bash
npm run build   # production build
npm run start   # run production build
npm run lint    # ESLint
```

---

## Main routes

| Path | Purpose |
|------|---------|
| `/login` | Staff login |
| `/dashboard` | Recent assessments, drafts, upcoming reviews |
| `/search` | Find patient by NHI, start assessment |
| `/assessment?nhi=…` | New assessment for a patient |
| `/assessment?assessmentId=AB12` | Open existing assessment (LLNN id) |
| `/history/[patientId]` | Patient assessment history |

Protected pages use `AuthGuard` (session in `sessionStorage` under `staffInfo`). Logout clears the session and sends users to `/login`.

---

## Repository layout

```
spinal-cord-assessment/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # UI (assessment form, dashboard, layout)
│   └── lib/              # Supabase client, persist logic, assessment IDs
├── supabase/
│   ├── schema.sql        # Full database CREATE (empty DB)
│   ├── seed.example.sql  # Optional dev seed template
│   └── migrations/       # Incremental changes (e.g. LLNN ids)
├── .env.example          # Environment variable template
└── public/               # Static assets (e.g. ISNCSCI PDF template)
```

**Important libraries**

- [`isncsci`](https://www.npmjs.com/package/isncsci) — classification calculations in the assessment form
- `@supabase/supabase-js` — database access from the browser and API routes

**Key files**

- `src/lib/persistAssessment.ts` — save draft/final assessment + allocate LLNN id
- `src/lib/assessmentExamData.ts` — load exam scores for an assessment
- `src/lib/assessmentId.ts` — LLNN format validation and generation
- `src/app/api/login/route.ts` — username/password check against `Staff Credentials`

---

## Database overview

Rough entity flow:

```
Patient → Assessment (assessment_id LLNN) → Exam → Exam Side → Motor / Light Touch / Pin Prick scores
                              ↓
                    Classification Result (AIS grade)
                    Draft Assessment / Assessment Version / Final Assessment
```

All tables live in the `public` schema with **RLS enabled**. The bundled `schema.sql` adds permissive policies for **`anon` and `authenticated`** so the prototype works with the browser anon key. **Replace with strict policies before any real patient (PHI) data.**

---

## Handover checklist

- [ ] New Supabase project created (or access to existing **ISNCSCI** project)
- [ ] `.env.local` filled from `.env.example`
- [ ] `schema.sql` or migrations applied
- [ ] At least one staff user can log in
- [ ] `npm run dev` loads dashboard and can open an assessment
- [ ] Confirm RLS / auth plan before production (see security note below)

---

## Security (prototype vs production)

Current prototype behaviour:

- Client-side “session” (`sessionStorage`) after custom login
- Supabase **anon** key in the browser
- Broad RLS policies in `schema.sql` for ease of development

Before production:

- Use **Supabase Auth** (or equivalent) and **httpOnly** cookies
- Restrict RLS by role / `staff_id`
- Never expose **service role** keys to the client
- Do not use permissive `USING (true)` policies on PHI tables

---

## Support & docs

- [Next.js documentation](https://nextjs.org/docs)
- [Supabase documentation](https://supabase.com/docs)
- [Supabase CLI migrations](https://supabase.com/docs/guides/cli/local-development)

For schema questions, start with `supabase/schema.sql` and the migration in `supabase/migrations/`.
