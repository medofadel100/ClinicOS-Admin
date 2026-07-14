# ClinicOS — Admin Dashboard — Architecture

Status: MVP phase 1 (internal admin tool only)
Owner: Ahmed
Last updated: 2026-07-13

## 1. Purpose

ClinicOS Admin is the internal dashboard Ahmed and his team use to run the
ClinicOS business itself. It is **not** the clinic-facing product. It is
where subscriptions, payments, trials, usage, and feature entitlements for
every clinic customer are managed.

This system is the **source of truth** for "who is a paying customer, what
are they allowed to use, and did they pay." The future clinic-facing web app
and the future Windows desktop app will both read entitlement data that
originates here (via API, described in section 6). They are not built yet —
this phase only builds the admin tool, but the data model is designed so
those two systems can plug in later without a schema rewrite.

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) + TypeScript | Ahmed's established stack across other projects |
| UI | Tailwind CSS + shadcn/ui | fast to build, RTL-friendly |
| Backend / DB | Supabase (Postgres + Auth + Row Level Security) | already the agreed choice |
| Hosting | Vercel (connected to GitHub repo, auto-deploy on push to `main`) | matches Ahmed's current test deployment setup |
| State management | React Server Components + minimal client state (Zustand only where needed) | avoid unnecessary client complexity |
| Language | TypeScript everywhere, `strict: true` | shared with future apps |
| i18n | Lightweight context-based dictionary (not full next-intl routing) | see section 8 below for reasoning |

No payment gateway integration in this phase (see Rules_and_Constraints,
constraint C-3). No AI/token usage collection pipeline is built yet — only
the table to store usage numbers that a future system will write into.

## 3. High-level modules

1. **Auth & Admin Users** — login restricted to people in the
   `platform_admins` table. No public sign-up. Roles: `super_admin`,
   `accountant`, `support`.
2. **Clinic Types Catalog** — the list of clinic specialties ClinicOS
   supports (dental, multi-department medical center, dermatology, etc.).
   Managed by super_admin only.
3. **Feature Catalog** — every feature that exists anywhere in the ClinicOS
   product line, each with a price and optional clinic-type applicability.
4. **Plans** — bundles of features sold at one price.
5. **Clinics (customer accounts)** — the actual paying (or trialing)
   customers. Each has a type, a subscription, feature overrides, payment
   history, and usage history.
6. **Subscriptions & Trials** — tracks what plan a clinic is on, trial
   expiry, renewal date, status.
7. **Payments (manual)** — a human (Ahmed or the accountant role) records
   that money came in. No gateway calls this phase.
8. **Usage / Token Tracking** — a table that stores usage numbers per clinic
   per period. Read-only reporting UI in this phase; the *writers* of this
   data (the future WhatsApp bot / web app) don't exist yet.
9. **Upgrade Requests** — when a clinic user hits a locked feature in the
   (future) clinic-facing app and clicks "contact us," a request lands here
   for follow-up. The table and inbox UI are built now even though the
   client-side trigger doesn't exist yet.
10. **Discounts & Coupons** — codes for new-customer promotions and
    early-renewal incentives, applied at the moment a subscription is
    created (see `03_Data_Models.md` section 14 and
    `07_Plans_and_Packages_Reference.md`).
11. **Announcements** — sending renewal reminders, promotions, and updates
    to clinic owners via email and WhatsApp. Admin-to-clinic communication
    only, never patient-facing (see `02_Rules_and_Constraints.md` section G
    for the WhatsApp-ban-risk rules that govern how this is built).
12. **Audit Log** — every mutation to subscriptions, payments, and feature
    overrides is recorded, because this is money- and access-control-related
    data.
13. **In-App Notifications** — an internal notification center *for the
    admin team itself* (`platform_admins`), separate from Announcements
    (module 11), which sends messages *externally* to clinic customers.
    A super_admin can broadcast a notification to all admins (or a
    specific role); every admin has a notification bell/inbox inside the
    dashboard showing unread items. Do not merge this with the
    Announcements module — they have different audiences, different
    channels, and different permission rules (see
    `02_Rules_and_Constraints.md` section C).
14. **License Management** — issuing and tracking the signed license each
    clinic's future Windows desktop app will verify. Auto-issued/refreshed
    on subscription creation/renewal (see `03_Data_Models.md` sections
    19–20). This module owns issuance, status (active/suspended/revoked),
    expiry, and device-activation tracking; it does NOT own the actual
    offline verification logic (public-key check, hardware binding) — that
    lives in the future desktop app repo, which only *consumes* what this
    module produces via the API in section 6 below.

## 4. Folder structure

This repo is scoped to the admin app only for now, but structured so it can
become a workspace inside a future monorepo without a big rewrite:

```
clinicos-admin/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── clinics/              # list, detail, subscription, overrides
│   │   ├── plans/                # plan + feature catalog management
│   │   ├── payments/             # manual payment entry + history
│   │   ├── usage/                # usage/token reports
│   │   ├── upgrade-requests/     # inbox
│   │   ├── discounts/            # discount code management
│   │   ├── announcements/        # compose & send email/WhatsApp campaigns
│   │   └── admins/               # super_admin only: manage admin users
│   └── api/                      # route handlers (see section 6)
├── lib/
│   ├── supabase/                 # server + browser clients
│   ├── entitlements.ts           # computes effective feature access
│   ├── audit.ts                  # audit log writer helper
│   ├── discounts.ts              # discount code validation/application
│   ├── whatsapp/                 # Baileys session + rate-limited sender
│   └── email/                    # transactional email sender
├── components/
├── types/                        # generated Supabase types + shared enums
└── supabase/
    └── migrations/                # SQL migrations, one per checkpoint
```

## 5. Entitlement computation (core logic)

For a given clinic, effective feature access is computed as:

```
effective_features =
    (features included in clinic's active plan)
    + (active 'grant' overrides for this clinic)
    - (active 'revoke' overrides for this clinic)
```

This logic lives in one place (`lib/entitlements.ts`) and is never
duplicated. Every place in the codebase that needs to know "can this clinic
use feature X" calls this function — including the future API endpoint that
the clinic-facing app will call.

## 6. Integration surface for future systems (build now, consume later)

Four API routes are created in this phase — two were already planned
before any external system existed to call them; two more (the license
endpoints) are needed now that license issuance is in scope
(module 14 above), even though the Windows desktop app that will actually
call them doesn't exist yet either. Same principle either way: decide the
data model and auth model once, here, rather than retrofitting later.

- `POST /api/v1/entitlements/check` — given a clinic ID and a feature code,
  returns whether it's allowed. Will be called by the clinic web app and,
  eventually, the Windows app.
- `POST /api/v1/usage/report` — lets a future system (WhatsApp bot, web app)
  push a usage record (e.g. AI tokens consumed). Protected by a service-role
  API key, not a user session.
- `GET /api/v1/license/current` — **user-session authenticated** (not a
  service-role key) — returns the calling clinic's current
  `signed_payload` from `clinic_licenses`. This is what lets the desktop
  app auto-recognize a licensed account when it has internet, with no
  manual serial entry, per Ahmed's requirement.
- `POST /api/v1/license/activate` — **service-role/API-key authenticated**
  — given a `serial_code` and a `hardware_fingerprint`, validates the
  license (active, not expired, under `max_activations`), creates a
  `license_activations` row, and returns the `signed_payload`. This is the
  path used for a true offline-at-install bootstrap, where a
  `serial_code` was delivered to the clinic out-of-band (see
  `03_Data_Models.md` section 19).

These routes are stubbed with real implementations against the real tables
— they are not fake placeholders — but no external system is registered to
call them yet.

## 7. Environments

Single Supabase project for now (test/staging use, per Ahmed's current
setup). When this moves to real production billing, a second Supabase
project should be created for production and the test project kept for
development — this is a checkpoint-7+ concern, not part of this phase.

## 8. Language / bilingual UI

This dashboard is used only by `platform_admins` — a small, known set of
people — not the public. That changes the right i18n approach compared to
a public-facing product:

- **No URL-based locale routing** (no `/ar/...` vs `/en/...` paths). A
  public product needs that for SEO and shareable links; an internal tool
  used by a handful of known people doesn't. Adding it would mean extra
  routing complexity for no real benefit here.
- **Language is a property of the logged-in admin, not the browser or the
  URL.** On login, the app reads `platform_admins.preferred_language` and
  renders the whole UI in that language — Arabic (RTL) or English (LTR) —
  for the rest of the session. A visible toggle in the account menu lets
  the admin switch, which updates the column immediately so it's
  remembered next time they log in, from any device.
- Implementation: a simple React context holding the current language and
  a flat dictionary of UI strings (JSON per language), not a full i18n
  routing framework. This keeps things simple for an internal tool while
  still giving proper Arabic/English coverage and correct `dir="rtl"` /
  `dir="ltr"` switching at the root layout.
- This is a different, simpler need than the future clinic-facing web app,
  which likely *does* need proper URL-based locale routing since it's
  public-facing — that's a decision for that project's own Architecture.md,
  not this one.

Deployment: GitHub → Vercel, auto-deploy on push to `main`. No staging
branch yet; Ahmed reviews locally before merging.
