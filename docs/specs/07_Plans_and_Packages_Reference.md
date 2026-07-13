# ClinicOS — Plans & Packages Reference

This is the business definition of what ClinicOS actually sells. It is the
seed-data source for Checkpoint 2 (clinic types, feature catalog, plans) —
whoever builds that checkpoint's seed script reads this file, not the other
way around. If pricing or package details change later, update this file
first, then regenerate the seed data.

Prices below are **placeholders** (`TBD`) — Ahmed sets real EGP prices
through the admin UI (Checkpoint 2), not by editing this file's numbers
directly. What's fixed here is the *structure*: what each tier includes,
its limits, and how they relate to each other.

## The billing unit: "Provider Seat"

One **provider seat** = one doctor with their own schedule and their own
exam room/chair. This term is deliberately neutral across specialties — a
dental chair and a general-practice exam room are the same unit for billing
purposes. See `03_Data_Models.md` section 13 (`plan_limits`).

## The four packages

### 1. Basic (الأساسية)

- Provider seats: **2**
- Patients: 500
- Staff accounts: 2
- WhatsApp bot: none
- AI features: none
- Financial reports: basic (revenue/expense totals only)
- Offline desktop app: **not included** — available as a paid add-on (see
  "Add-on Features" below)
- Support: limited (email only)
- Price: TBD

### 2. Professional (الاحترافية)

- Provider seats: **5**
- Patients: 3,000
- Staff accounts: 5
- WhatsApp bot: **rule-based menu bot** (no AI) — numbered options like
  "1. Book an appointment, 2. Talk to reception, 3. Cancel an appointment."
  Reads real availability from the system; no natural-language
  understanding, no AI token cost.
- AI features: none
- Financial reports: standard
- Offline desktop app: not included by default — available as a paid
  add-on
- Support: standard
- **Includes a promotional gift**: a clinic public website / booking
  microsite, connected live to the clinic's own system data. This is
  normally a paid standalone add-on feature (see below) but is granted free for a
  limited promotional period to attract Professional+ signups — see
  "Promotional gifts" below for exactly how this is implemented.
- Price: TBD

### 3. Advanced (المتقدمة)

- Provider seats: **10**
- Patients: unlimited (or a very high ceiling — Ahmed to decide the actual
  cap when setting this plan up)
- Staff accounts: unlimited
- WhatsApp bot: **full AI bot** — understands natural language, recommends
  a doctor/specialty based on the patient's description, books
  appointments, and follows up after the visit (reminders, check-ins).
  This is the tier where the AI token cost discussed earlier applies.
- Financial reports: advanced, with analytics
- Offline desktop app: **included**
- Clinic public website: **included**, permanently (not time-limited like
  the Professional tier's promotional gift)
- Support: priority
- Price: TBD

### 4. Offline (الأوفلاين)

A distinct plan for clinics whose primary need is reliable offline
operation rather than online features — e.g. a clinic with poor or no
internet. This is a full plan (its own price, its own limits), not just
"Basic plus the offline add-on."

- Provider seats: **2** (same as Basic — adjust later if Ahmed wants a
  different starting size)
- Patients: 500
- Staff accounts: 2
- WhatsApp bot: none (requires connectivity to function meaningfully)
- Offline desktop app: **included by default** — this is the point of the
  plan
- Web dashboard access: still included (per the unified architecture in
  `01_Architecture.md` — offline is a resilience feature of the desktop
  client, not a separate product; a clinic on this plan still has a normal
  online account, they just rely on the desktop app's offline capability
  more heavily)
- Support: limited
- Price: TBD

## Add-on Features (available on any plan, independent of tier)

These are individual rows in the `features` table with their own
`base_price_egp`, purchasable as `account_feature_overrides` grants on top
of whatever plan a clinic is on:

| Feature code | What it is | Notes |
|---|---|---|
| `offline_desktop_app` | Access to the Windows desktop app | Included by default in Advanced and Offline plans; paid add-on for Basic/Professional |
| `clinic_website` | Public booking microsite for the clinic | Included by default in Advanced (permanent) and gifted temporarily on Professional (see below); paid add-on for Basic |
| `doctor_commissions` | Per-doctor revenue/commission tracking | Useful for medical centers with non-owner doctors |
| `recall_campaigns` | Automatic "you're due for a follow-up" WhatsApp messages | Requires the AI or rule-based bot to already be active on the account |
| `queue_display` | Waiting-room "now serving" screen | |
| `white_label` | Custom domain/branding instead of ClinicOS branding | Realistically Advanced-tier only, priced accordingly |

## Promotional gifts (how the free website gift actually works)

The Professional-tier `clinic_website` gift is **not** a separate mechanism
— it uses the exact feature-override system already built:

1. When a clinic subscribes to (or is moved to) the Professional plan, the
   admin (or, later, an automated step) creates an
   `account_feature_overrides` row: `feature_id` = `clinic_website`,
   `override_type` = `grant`, `price_addon_egp` = `0`, `expires_at` = a
   date marking the end of the promotional period, `note` = something like
   "Professional launch promo — free website for 3 months."
2. When `expires_at` passes, the override simply stops applying (per the
   entitlement logic in `01_Architecture.md` section 5) and the feature
   reverts to locked/paid — no special "promo expired" code path is
   needed, this falls out of the existing design automatically.
3. This means the *promotional period length* is a business decision Ahmed
   makes per campaign, not a hardcoded value in the app.

## Discounts (new customers & early renewals)

Handled by the `discount_codes` table (`03_Data_Models.md` section 14).
Two intended use patterns:

- **New customer discount**: a code like `WELCOME20`, `applies_to =
  'new_subscription'`, given out in marketing campaigns.
- **Early-renewal discount**: a code generated (initially manually, by an
  admin) and sent to a specific clinic via the Announcements module
  (`03_Data_Models.md` sections 15–16) before their `current_period_end`,
  incentivizing them to renew ahead of expiry instead of risking a lapse.

Both reduce the price at the moment a `clinic_subscriptions` row is
created, and the discounted result is what gets locked into
`price_locked_egp` — consistent with the pricing rules in
`02_Rules_and_Constraints.md` section I.
