# ClinicOS Admin — Project Structure & File Placement Rules

This file exists so the coding agent never has to guess "where does this
new file go" or "what do I name it." If a situation isn't covered here,
stop and ask Ahmed rather than inventing a convention — then this file
should be updated so the question never comes up again.

## 1. The folder structure is fixed

This is the full folder tree for `ClinicOS Admin`. Do not create a new
top-level folder (a sibling of `app/`, `lib/`, `components/`, etc.) without
explicit approval — propose it first, explain why the existing structure
doesn't fit, and wait.

```
ClinicOS Admin/
├── docs/
│   └── specs/                    # the 7 spec files — read-only reference,
│                                  # never edited by the agent unless Ahmed
│                                  # explicitly asks for a spec change
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── clinics/
│   │   ├── plans/
│   │   ├── payments/
│   │   ├── usage/
│   │   ├── upgrade-requests/
│   │   ├── discounts/
│   │   ├── announcements/        # compose & send email/WhatsApp to clinics
│   │   ├── notifications/        # in-app notification center + broadcast composer
│   │   └── admins/
│   └── api/v1/
│       ├── entitlements/check/
│       └── usage/report/
├── lib/
│   ├── supabase/                 # server.ts, client.ts — Supabase client setup only
│   ├── entitlements.ts
│   ├── audit.ts
│   ├── discounts.ts
│   ├── whatsapp/                 # Baileys session + rate-limited sender
│   ├── email/                    # transactional email sender
│   └── i18n/
│       ├── dictionaries/         # ar.json, en.json — flat key-value UI strings
│       └── context.tsx           # LanguageProvider, reads/writes preferred_language
├── components/
│   ├── ui/                       # shadcn/ui primitives, do not hand-edit generated ones
│   └── [feature]/                # one subfolder per feature area, e.g. components/clinics/
├── types/
│   └── database.ts               # generated from Supabase schema, never hand-edited
├── supabase/
│   └── migrations/                # one .sql file per checkpoint, see section 3
└── CHECKPOINT_STATUS.md
```

## 2. Naming conventions

| What | Convention | Example |
|---|---|---|
| Route folders (`app/`) | lowercase, kebab-case | `app/(dashboard)/upgrade-requests/` |
| React component files | PascalCase.tsx | `ClinicDetailCard.tsx` |
| Non-component TS files (`lib/`, `types/`) | camelCase.ts | `entitlements.ts` |
| Database tables & columns | snake_case | `clinic_subscriptions`, `trial_ends_at` |
| Database enum types | snake_case, suffixed `_status` / `_type` / `_role` where it fits | `subscription_status` |
| SQL migration files | `YYYYMMDDHHMM_short_description.sql` | `202607141030_create_platform_admins.sql` |
| Environment variables | SCREAMING_SNAKE_CASE | `SUPABASE_SERVICE_ROLE_KEY` |

## 3. Where new code goes, by type

- A new database table → one new migration file in `supabase/migrations/`,
  named per the convention above. Never edit a migration that has already
  been applied — write a new one, even for a small fix.
- A new admin-facing page → a new folder under
  `app/(dashboard)/[feature-name]/`, following the pattern of existing
  feature folders.
- A new reusable UI piece used by only one feature → lives inside
  `components/[that feature]/`, not in `components/ui/`.
- A new reusable UI piece used by more than one feature → lives in
  `components/` directly (no subfolder), and only after it's proven needed
  in two places — don't pre-abstract for a single use case.
- Shared business logic (anything that isn't purely UI rendering) → `lib/`,
  never inline inside a page component.
- A new environment variable → add it to `.env.example` with a comment
  explaining what it's for, in the same commit that introduces the code
  using it. Never commit the real value.

## 4. Import paths

- Use the `@/` path alias (already configured in `tsconfig.json`) for all
  internal imports — `@/lib/entitlements`, `@/components/clinics/ClinicCard`.
  Never use relative paths like `../../../lib/entitlements`.
- Database types are always imported from `@/types/database`, never
  redefined locally.

## 5. What the agent must never touch

- `docs/specs/*` — reference only, read but never write, unless Ahmed
  explicitly says "update the spec file."
- `types/database.ts` — regenerate via the Supabase CLI command, never
  hand-edit.
- `components/ui/*` — these are shadcn/ui generated primitives; customize
  via props/className, don't rewrite the generated source.
- Anything under `supabase/migrations/` that has already been applied to
  the database — write a new migration instead of editing an old one.

## 6. Repo-root files and where they belong

- `CHECKPOINT_STATUS.md` lives at the project root (`ClinicOS Admin/`, next
  to `package.json`), not inside `docs/`.
- `.env.example` lives at the project root and is committed. `.env.local`
  lives at the project root and is **never** committed (see
  `02_Rules_and_Constraints.md` section G for why).
