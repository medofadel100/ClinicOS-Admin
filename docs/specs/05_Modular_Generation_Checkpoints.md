# ClinicOS Admin — Modular Generation Checkpoints

Build strictly in this order. Do not start a checkpoint before the previous
one is reviewed and approved by Ahmed. Each checkpoint lists its goal,
deliverables, and acceptance criteria — the agent must self-check against
the acceptance criteria before declaring the checkpoint done.

Track progress by updating a `CHECKPOINT_STATUS.md` file at the repo root
after each approval (checkpoint number, date completed, one-line note).

---

## Checkpoint 0 — Project setup

**Goal:** a running, empty Next.js + Supabase project connected to GitHub
and Vercel, with nothing business-specific in it yet.

**Deliverables:**
- Next.js 14 App Router project, TypeScript strict mode on.
- Tailwind + shadcn/ui installed and configured for RTL support.
- `lib/i18n/` scaffolded with `ar.json` and `en.json` dictionaries (can
  start with just a handful of shared strings — filled in properly as each
  later checkpoint adds UI) and a `LanguageProvider` context, per
  `01_Architecture.md` section 8.
- Supabase project connected, environment variables set up (local `.env`
  and Vercel env vars), Supabase CLI configured for migrations.
- GitHub repo created, connected to Vercel for auto-deploy on `main`.
- A single placeholder page confirming the deploy pipeline works, rendered
  in both languages via the `LanguageProvider` to prove the i18n scaffold
  works end to end.

**Acceptance criteria:**
- [ ] `git push` to `main` results in a successful Vercel deploy automatically.
- [ ] Supabase client connects successfully from both server and browser contexts.
- [ ] `npm run build` passes with zero TypeScript errors.

---

## Checkpoint 1 — Auth & admin users

**Goal:** only people in `platform_admins` can log in; everyone else is
rejected. Role-based route access works.

**Deliverables:**
- `platform_admins` table + RLS policies (Data_Models.md section 1),
  including `preferred_language`.
- Login page (Supabase Auth — email/password or magic link, agent's choice
  unless Ahmed specifies).
- Middleware that checks the logged-in Supabase Auth user has a matching,
  active `platform_admins` row; signs them out otherwise.
- On successful login, the app reads `preferred_language` and renders the
  dashboard shell in that language/direction. A language toggle in the
  account menu updates the column and switches immediately.
- A minimal `/admins` page (super_admin only) to list and add admin users —
  manually, by inserting an already-existing Supabase Auth user's ID for
  now (no invite-email flow yet, that's out of scope).

**Acceptance criteria:**
- [ ] A Supabase Auth user with no `platform_admins` row cannot reach any dashboard page.
- [ ] A `support` role user cannot reach `/admins`.
- [ ] RLS on `platform_admins` independently blocks a non-super_admin from inserting a row, even via a direct API call.
- [ ] Switching the language toggle updates `preferred_language` and persists across logout/login.

---

## Checkpoint 2 — Clinic types, feature catalog, plans

**Goal:** the configuration layer that everything else depends on exists
and is manageable from the UI.

**Deliverables:**
- `clinic_types`, `features`, `plans`, `plan_features`, `plan_limits`
  tables + RLS.
- Admin UI (super_admin only) to CRUD clinic types, features (with price,
  category, applicable clinic types), and plans (with which features are
  bundled and their numeric limits — provider seats, patients, staff
  accounts, per `plan_limits`).
- Seed data entered (via the UI, not a raw SQL script) matching
  `docs/specs/07_Plans_and_Packages_Reference.md` exactly: the four plans
  (Basic, Professional, Advanced, Offline) with their limits, and the
  standalone add-on features listed in that file's "Add-on Features"
  table.

**Acceptance criteria:**
- [ ] A super_admin can create a clinic type, a feature, and a plan, assign features to the plan, and set its provider-seat/patient/staff limits, entirely through the UI.
- [ ] The four plans from `07_Plans_and_Packages_Reference.md` exist in the database with correct limits (prices can be placeholder values until Ahmed sets real ones).
- [ ] An accountant or support user can view this data but cannot edit it (enforced by RLS, not just hidden buttons).

---

## Checkpoint 3 — Clinics & subscriptions

**Goal:** customer accounts exist and can be assigned a plan.

**Deliverables:**
- `clinics`, `clinic_subscriptions` tables + RLS.
- Admin UI to create a clinic (name, type, owner contact, initial status),
  assign it a plan, and see its subscription history.
- Trial logic: creating a clinic with status `trial` auto-sets
  `trial_ends_at` to 7 days from creation on the subscription row.

**Acceptance criteria:**
- [ ] Creating a trial clinic produces a subscription row with `trial_ends_at` exactly 7 days out.
- [ ] Changing a clinic's plan inserts a new `clinic_subscriptions` row and marks the previous one `cancelled` — it never edits the old row's period dates.
- [ ] Every new subscription row snapshots the plan's current price into `price_locked_egp` at creation time.
- [ ] Editing `plans.price_egp` afterward does NOT change `price_locked_egp` on any existing subscription row — verify by editing a plan's price and confirming an already-subscribed clinic's locked price is unchanged.
- [ ] `accountant` role can perform all of the above; `support` role can only view.

---

## Checkpoint 4 — Feature overrides & entitlement engine

**Goal:** the per-clinic grant/revoke system works, and the single
entitlement-computation function (`lib/entitlements.ts`, per
Architecture.md section 5) is implemented and tested.

**Deliverables:**
- `account_feature_overrides` table + RLS.
- Admin UI to grant or revoke a specific feature for a specific clinic,
  with an optional price add-on and note.
- `lib/entitlements.ts` exporting a function that, given a clinic ID,
  returns the full effective feature list (plan features + grants − revokes).
- A read-only "entitlements" view on the clinic detail page showing the
  computed result, not just the raw plan/override rows.

**Acceptance criteria:**
- [ ] Granting a feature not in a clinic's plan makes it appear in the computed entitlement list.
- [ ] Revoking a feature that IS in the clinic's plan makes it disappear from the computed list.
- [ ] An expired override (past `expires_at`) has no effect on the computed list.
- [ ] Only super_admin and accountant can create overrides.

---

## Checkpoint 5 — Payments (manual)

**Goal:** manually recording and tracking payments end to end.

**Deliverables:**
- `payments` table + RLS.
- UI to record a payment against a clinic (amount, method, reference note,
  status), linked to a subscription where relevant.
- Clinic detail page shows full payment history.
- A "payments due soon" or "past_due" list view, filterable by date range.

**Acceptance criteria:**
- [ ] Recording a payment correctly links to the clinic's current subscription.
- [ ] The payments list can be filtered by status and date range.
- [ ] `support` role cannot view or create payments (enforced by RLS).

---

## Checkpoint 6 — Usage/token reporting & upgrade requests

**Goal:** the read-side reporting for usage data, and the inbox for
upgrade requests, both exist and are ready to receive data from future
systems.

**Deliverables:**
- `usage_logs`, `upgrade_requests` tables + RLS.
- Usage report page: per-clinic and per-period usage totals (chart or
  table — agent's choice).
- Upgrade requests inbox: list, filter by status, mark as
  contacted/resolved.
- The two integration API routes from Architecture.md section 6
  (`/api/v1/entitlements/check`, `/api/v1/usage/report`), protected by a
  service-role API key (not a user session), fully implemented against the
  real tables even though nothing calls them yet.

**Acceptance criteria:**
- [ ] Manually inserting a row into `usage_logs` via SQL shows up correctly in the report UI.
- [ ] `POST /api/v1/entitlements/check` with a valid API key and a real clinic/feature pair returns the correct boolean, matching what `lib/entitlements.ts` would compute.
- [ ] Both API routes reject requests without a valid service-role key.

---

## Checkpoint 7 — Audit log & renewal alerts

**Goal:** every financially/access-sensitive mutation is traceable, and the
dashboard surfaces what needs attention.

**Deliverables:**
- `audit_log` table + RLS (super_admin and accountant read-only, nobody
  writes to it directly — it's written by triggers or server-side code
  alongside every mutation to subscriptions, payments, and overrides).
- Audit log viewer page with filtering by table/actor/date.
- Dashboard home page: clinics whose `trial_ends_at` or
  `current_period_end` is within the next 7 days, and clinics with
  `past_due` status.

**Acceptance criteria:**
- [ ] Changing a subscription's plan produces a matching audit_log row in the same transaction.
- [ ] Recording a payment produces a matching audit_log row.
- [ ] Granting/revoking an override produces a matching audit_log row.
- [ ] The dashboard home page correctly lists clinics expiring within 7 days using live data, not a hardcoded example.

---

## Checkpoint 8 — Discounts & coupons

**Goal:** admins can create and apply discount codes for new subscriptions
and early renewals, per `07_Plans_and_Packages_Reference.md`.

**Deliverables:**
- `discount_codes` table + RLS, and the `discount_code_id` column added to
  `clinic_subscriptions` (additive migration, per Rules_and_Constraints.md
  section I).
- Admin UI to create a discount code (percentage or fixed amount, applies
  to new subscriptions / renewals / both, optional expiry and max uses).
- When creating a clinic subscription (checkpoint 3's flow), an admin can
  optionally apply a valid discount code — `lib/discounts.ts` validates it
  (active, not expired, not over `max_uses`, matches `applies_to`) and
  computes the resulting `price_locked_egp`.
- Applying a code increments its `times_used`.

**Acceptance criteria:**
- [ ] Applying a valid `new_subscription` code to a new clinic's subscription correctly reduces `price_locked_egp` and increments `times_used`.
- [ ] An expired or over-limit code is rejected with a clear error, not silently ignored.
- [ ] A `renewal`-only code cannot be applied to a brand-new clinic's first subscription.
- [ ] `support` role cannot create or apply discount codes.

---

## Checkpoint 9 — Announcements (email & WhatsApp to clinics)

**Goal:** admins can compose and send a message to a filtered set of
clinics via email and/or WhatsApp, with per-recipient delivery tracking,
following the ban-risk rules in `02_Rules_and_Constraints.md` section G.

**Deliverables:**
- `announcements`, `announcement_recipients` tables + RLS.
- Admin UI (super_admin only, per the role matrix) to compose a message,
  choose a channel (email / WhatsApp / both), define an audience filter
  (e.g. by plan, by status, by "expiring within N days"), and send
  immediately or schedule.
- `lib/whatsapp/` — a rate-limited sender using a dedicated Baileys session
  for ClinicOS's own number, sending only to existing `clinics` rows.
- `lib/email/` — a transactional email sender.
- Sending resolves the audience filter into individual
  `announcement_recipients` rows and updates each one's status as it's
  attempted, so a partial failure is visible and retryable per-recipient.

**Acceptance criteria:**
- [ ] Composing and sending an announcement to a filtered audience (e.g. "trial clinics expiring within 7 days") produces one `announcement_recipients` row per matching clinic per channel.
- [ ] A simulated send failure for one recipient doesn't block or retry the rest of the batch — it's marked `failed` independently.
- [ ] WhatsApp sending is rate-limited (a delay between messages), verified by checking timestamps on consecutive `announcement_recipients.sent_at` values.
- [ ] `accountant` and `support` roles can view announcement history but cannot create or send one.

---

## Checkpoint 10 — In-app notifications

**Goal:** a super_admin can broadcast a notification to the admin team
inside the dashboard, and every admin has a working notification
bell/inbox. This is separate from Checkpoint 9's Announcements — do not
reuse that code or those tables.

**Deliverables:**
- `notifications`, `notification_recipients` tables + RLS.
- A notification bell in the dashboard header showing an unread count,
  with a dropdown/inbox listing recent notifications (title, body, link if
  present, read/unread state).
- Admin UI (super_admin only) to compose and broadcast a notification,
  optionally targeted to a specific role via `target_role`.
- Broadcasting resolves the target into one `notification_recipients` row
  per matching admin.
- Opening/viewing a notification marks it read (`read_at` set) for that
  admin only — it doesn't affect other recipients' read state.

**Acceptance criteria:**
- [ ] Broadcasting to "all admins" creates one `notification_recipients` row per active admin.
- [ ] Broadcasting with `target_role = 'accountant'` only creates rows for accountant-role admins.
- [ ] Marking a notification read for one admin does not mark it read for others.
- [ ] `accountant` and `support` roles can view and read their own notifications but cannot broadcast one.

---

## Checkpoint 11 — License management

**Goal:** every clinic automatically gets a managed license, admins can
control its status and see activated devices, and the two API endpoints
the future desktop app will need already work correctly.

**Deliverables:**
- `clinic_licenses`, `license_activations` tables + RLS.
- Ed25519 (or equivalent) keypair generated; private key stored as a
  server-only environment variable (per `02_Rules_and_Constraints.md`
  section H); public key documented (e.g. in a `LICENSE_PUBLIC_KEY.md` at
  the repo root) so it's ready to hand to the future desktop app project.
- Auto-issuance: creating or renewing a `clinic_subscriptions` row
  automatically creates/updates that clinic's `clinic_licenses` row —
  `signed_payload` regenerated, `expires_at` synced to
  `current_period_end`.
- Admin UI on the clinic detail page: license status, expiry, serial code,
  list of activated devices with a "deactivate" action, and manual actions
  (suspend, revoke, regenerate serial/payload).
- `GET /api/v1/license/current` (user-session auth) and
  `POST /api/v1/license/activate` (service-role/API-key auth), per
  `01_Architecture.md` section 6.

**Acceptance criteria:**
- [ ] Creating a new clinic subscription automatically creates a `clinic_licenses` row with a correctly signed payload and `expires_at` matching the subscription's `current_period_end`.
- [ ] Renewing a subscription updates the existing license's `expires_at` and regenerates `signed_payload` — it does not create a duplicate license row.
- [ ] `GET /api/v1/license/current`, called with a valid clinic user session, returns that clinic's current signed payload and nothing else.
- [ ] `POST /api/v1/license/activate` with a valid serial code, called under `max_activations`, succeeds and creates a `license_activations` row; called again beyond `max_activations` is rejected.
- [ ] Suspending a license via the admin UI is reflected immediately if `/api/v1/license/current` is called again (a suspended license must not still validate as active).
- [ ] `accountant` can suspend/revoke/regenerate and deactivate devices; `support` can view only.

---

## After checkpoint 11

Stop and ask Ahmed for direction. Do not start building the clinic-facing
web app or the Windows desktop app from this repo — those are separate
projects with their own spec files, per `01_Architecture.md`.
