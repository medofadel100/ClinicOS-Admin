# ClinicOS — Admin Dashboard — Rules and Constraints

These rules are binding. If a task seems to require breaking one of them,
stop and ask Ahmed instead of improvising. This file exists so an AI coding
agent (or a new human developer) never has to guess.

## A. Hard constraints for this phase

- **C-1: No payment gateway integration.** All payments are recorded
  manually by an admin user. Do not add Paymob/Fawry/Stripe SDKs, webhooks,
  or checkout flows. The `payments` table must be designed so a gateway can
  be added later by adding columns, not by changing the model.
- **C-2: Admin-only access.** There is no public sign-up route in this app.
  Every authenticated user must exist in `platform_admins`. If a Supabase
  Auth user exists but has no matching `platform_admins` row, treat them as
  unauthorized and sign them out.
- **C-3: Never fully hide a locked feature from view inside the future
  clinic app's design** — this dashboard doesn't render that UI itself, but
  every feature-related table and API this dashboard produces must carry
  enough data (name, description, price, category) for the clinic app to
  render a "locked" preview rather than nothing. Do not model features as a
  simple boolean flag with no metadata.
- **C-4: Single Supabase project for this phase.** Don't provision a second
  project or environment yet.

## B. Security rules

- **RLS is mandatory on every table, no exceptions.** A table with RLS
  disabled is a bug, not a shortcut. Default-deny: policies must explicitly
  allow, never rely on an implicit allow.
- **Role checks happen in Postgres policies, not just in the UI.** The React
  layer may hide a button from a `support` role user, but the database must
  independently reject the same action if attempted directly. Never trust
  the client.
- **The Supabase service-role key is never used in browser-reachable code.**
  It is only used in server-side route handlers (e.g. the `/api/v1/*`
  integration routes in Architecture.md section 6), and only where RLS
  genuinely cannot express the needed check.
- **Every mutation to `clinic_subscriptions`, `payments`, and
  `account_feature_overrides` must write an `audit_log` row** in the same
  transaction — actor, action, before/after values. This is financial and
  access-control data; it must be traceable.
- Soft delete only. No table in this system uses `DELETE`. Use a `status` or
  `is_active` column instead. Historical payment and subscription data is
  never destroyed.

## C. Role permission matrix

| Action | super_admin | accountant | support |
|---|---|---|---|
| Manage admin users | yes | no | no |
| Manage clinic types / feature catalog / plans | yes | no | no |
| View clinics | yes | yes | yes |
| Edit clinic subscription (change plan, extend trial) | yes | yes | no |
| Record payments | yes | yes | no |
| Grant/revoke feature overrides | yes | yes | no |
| View payments & financial reports | yes | yes | no |
| View & respond to upgrade requests | yes | yes | yes |
| View audit log | yes | yes | no |
| Create/manage discount codes | yes | yes | no |
| Create & send announcements (external, to clinics) | yes | no | no |
| View announcement delivery status | yes | yes | yes |
| Broadcast an in-app notification (internal, to admins) | yes | no | no |
| View/read own in-app notifications | yes | yes | yes |

This table must be mirrored exactly in the RLS policies, not just in the UI
routing.

## D. Code conventions

- TypeScript `strict: true`. No `any` — use `unknown` and narrow, or define
  a proper type.
- Database identifiers: `snake_case`. TypeScript identifiers: `camelCase`.
  Generate TS types from the Supabase schema rather than hand-writing them,
  so they never drift.
- All dates/times stored as `timestamptz` in UTC. Format for display at the
  UI layer only, using the clinic's or admin's local timezone (Africa/Cairo
  by default).
- Money is stored as `numeric`, in EGP, never as `float`.
- Every enum used in the database (status fields, roles, etc.) is defined as
  a Postgres `enum` type, not a free-text column with app-level validation
  only.
- Server Actions / route handlers validate all input with a schema library
  (Zod) before touching the database. Never trust a request body directly.

## E. UI / UX rules

- The dashboard interface is bilingual: Arabic (RTL) and English (LTR),
  chosen per-admin via `platform_admins.preferred_language`, not detected
  from the browser — see `01_Architecture.md` section 8 for the full
  reasoning and why this repo deliberately does NOT use URL-based locale
  routing. Use logical CSS properties (`margin-inline-start`, not
  `margin-left`) so both directions render correctly from the same markup.
- **Announcements (external, to clinics) and In-App Notifications
  (internal, to the admin team) are two separate features — never
  implement them as one shared table or one shared UI component.** They
  have different audiences, different channels (email/WhatsApp vs in-app
  bell/inbox), and different permissions (see section C). If a task
  mentions "notifications" ambiguously, stop and confirm which one is
  meant rather than guessing.
- No destructive action (revoke a feature, suspend a clinic, mark a payment
  failed) executes without a confirmation step.
- Every list view (clinics, payments, usage) must support filtering by
  status and date range — this is an operational tool used daily, not a
  demo.

## F. What NOT to build in this phase

To keep scope honest and prevent an AI agent from over-building:

- **No patient-facing messaging of any kind.** The `announcements` module
  (section G below, and Data_Models.md sections 15–16) sends messages from
  ClinicOS to clinic *owners/staff* only — never to a clinic's patients.
  Any WhatsApp AI bot that talks to patients belongs to a different,
  future product (the clinic-facing web app), not this repo.
- No license/serial signing logic yet (that belongs to the future
  `license-core` package for the Windows app, not this admin dashboard).
- No multi-currency support. EGP only.
- No automatic discount generation yet (Checkpoint 8 builds manual
  creation and application of discount codes by an admin; auto-generating
  a renewal discount and auto-sending it is a later enhancement, not part
  of this phase).

## G. Announcements: email & WhatsApp to clinics (in scope this phase)

This phase DOES include sending messages to clinic owners — renewal
reminders, promotions, general updates — via email and/or WhatsApp. Rules:

- **Email** uses a standard transactional email provider (agent's choice of
  a well-supported one, e.g. Resend — confirm with Ahmed before adding a
  new paid dependency). Straightforward, no special risk.
- **WhatsApp** uses the same unofficial approach Ahmed already relies on in
  his other projects (Baileys), not the paid WhatsApp Business API. This
  needs its own dedicated WhatsApp number/session for ClinicOS itself
  (separate from any clinic's own number).
- **WhatsApp ban risk is real and must be respected in how the feature is
  built.** Unofficial WhatsApp automation gets numbers banned when used for
  bulk, unsolicited, cold messaging. This feature must only be used to
  message clinics that are already existing customers (have a
  `clinics` row) — never for cold outreach to numbers outside the system.
  Keep sending rate-limited (a delay between messages, not an instant
  blast) — this is a hard requirement for the sending implementation, not
  a suggestion.
- Every send is logged per-recipient in `announcement_recipients` so a
  failure can be identified and retried individually, not by re-sending
  the whole campaign.

## H. Secrets & source protection

Realistic expectation first: no technical measure makes source code
"unreadable" to a sufficiently determined person, especially for the future
Windows desktop app which runs entirely on someone else's machine. These
rules raise the cost of copying/tampering and protect what can actually be
protected — they are not a claim of perfect secrecy.

- **GitHub repo is Private, always.** Never make it public, even
  temporarily. Collaborator access is granted per-person, not via a shared
  link.
- **No secret ever enters git history.** `.env.local` (or any file holding
  real API keys, the Supabase service-role key, or a future license-signing
  private key) is listed in `.gitignore` from the very first commit of the
  project — not added after the fact. Only `.env.example` with placeholder
  values is committed.
- **The Supabase service-role key and any future license-signing private
  key live only as environment variables on the server** (Vercel env vars /
  the future license-server host) — never in client-reachable code, never
  logged, never returned in an API response.
- **Production builds never ship browser source maps.** Next.js:
  `productionBrowserSourceMaps: false` (this is the framework default —
  verify it stays false, don't enable it for "easier debugging" in
  production).
- **Rotate any key immediately if it is ever accidentally committed**, even
  if the commit is later removed from history — assume it was seen.
- These rules apply to this repo now. When the Windows desktop app repo is
  created later, it additionally needs JavaScript obfuscation of the
  Electron app's compiled output before packaging, and Windows code-signing
  — those are out of scope for this repo and will be specified in that
  project's own `02_Rules_and_Constraints.md` when it's built. The real
  protection for that app is the license/serial system itself (a copied
  binary still won't run without a valid signed license) — obfuscation is
  a secondary deterrent, not the primary defense.

## I. Schema evolution & change management

These rules govern how the database is allowed to change over time, after
the initial checkpoints are done — this is what makes the system "smart"
about future updates instead of breaking on them.

- **Migrations are additive by default.** Adding a table or a column is
  always safe and needs no special approval beyond the normal checkpoint
  review. Renaming or dropping a column/table is never done in a single
  step — first add the new version, backfill data, update the code to use
  it, confirm nothing references the old one, and only then remove it in a
  later, separate migration.
- **Price changes never retroact.** Editing `plans.price_egp` only affects
  new subscriptions created after that point. Every existing clinic keeps
  the price captured in `clinic_subscriptions.price_locked_egp` (see
  Data_Models.md section 7) until Ahmed deliberately moves them to a new
  subscription row. No code path may bulk-update `price_locked_egp` across
  existing rows as a side effect of a plan price edit.
- **Feature inclusion changes are live by design.** Editing which features
  belong to a plan (`plan_features`) takes effect immediately for every
  clinic on that plan, because entitlement is always computed live (see
  Architecture.md section 5). This is intentional, not a gap — do not add
  a "locking" mechanism for feature sets without Ahmed asking for one
  explicitly.
- **Deprecating a clinic type, feature, or plan** is done by setting
  `is_active = false`, never by deleting the row. Inactive rows stay
  selectable in historical reports and on existing clinics' records, but
  disappear from "create new" dropdowns.
- **Every schema change regenerates `types/database.ts` in the same
  commit** (via the Supabase CLI type generator), so the TypeScript layer
  can never silently drift from the real schema.
- **When a new checkpoint or a later change needs a schema decision that
  conflicts with an existing rule in this file** (for example, a future
  requirement to let clinics change plans mid-cycle with prorated pricing),
  stop and ask Ahmed rather than deciding unilaterally — then update this
  file so the decision is captured for next time.
