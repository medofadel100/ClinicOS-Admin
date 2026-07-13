# ClinicOS — Admin Dashboard — Data Models

This is the single source of truth for the database schema. Do not create,
rename, or drop a column outside of this file without updating it first —
if a checkpoint needs a schema change that isn't here, stop and ask Ahmed.

All tables live in Supabase Postgres, `public` schema, with RLS enabled per
the role matrix in Rules_and_Constraints.md section C.

## Entity overview

```
platform_admins ──┐
                   ├─< audit_log
clinic_types ──< clinics >── clinic_subscriptions >── plans >──< plan_features >── features
                   │                                                         │
                   ├─< account_feature_overrides ───────────────────────────┘
                   ├─< payments
                   ├─< usage_logs
                   └─< upgrade_requests
```

## 1. `platform_admins`

Who is allowed to log into this dashboard, and with what role.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| auth_user_id | uuid, unique, FK → `auth.users.id` | |
| full_name | text | |
| role | `admin_role` enum: `super_admin`, `accountant`, `support` | |
| preferred_language | `language_pref` enum: `ar`, `en` | default `ar`; the UI loads in this language on every login until the admin changes it |
| is_active | boolean | default true; soft-disable instead of delete |
| created_at | timestamptz | default now() |

## 2. `clinic_types`

The catalog of specialties ClinicOS supports.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| code | text, unique | e.g. `dental`, `medical_center`, `dermatology` |
| name_ar | text | |
| name_en | text | |
| description | text, nullable | |
| is_active | boolean | default true |
| created_at | timestamptz | |

## 3. `features`

Every feature that exists anywhere across the ClinicOS product line
(present system and future web/Windows apps).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| code | text, unique | e.g. `appointment_booking`, `ai_whatsapp_bot`, `doctor_commissions` |
| name_ar | text | |
| name_en | text | |
| description_ar | text, nullable | shown in the "locked feature" upsell card |
| description_en | text, nullable | |
| category | text | e.g. `scheduling`, `finance`, `automation` — for grouping in the UI |
| base_price_egp | numeric(10,2), nullable | price if sold as a standalone add-on; null = bundle-only |
| applicable_clinic_type_ids | uuid[], nullable | null = applies to all clinic types |
| is_active | boolean | default true |
| created_at | timestamptz | |

## 4. `plans`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| code | text, unique | e.g. `basic`, `pro`, `enterprise` |
| name_ar | text | |
| name_en | text | |
| price_egp | numeric(10,2) | |
| billing_cycle | `billing_cycle` enum: `monthly`, `yearly` | |
| is_active | boolean | default true |
| created_at | timestamptz | |

## 5. `plan_features` (junction)

| Column | Type | Notes |
|---|---|---|
| plan_id | uuid, FK → `plans.id` | part of composite PK |
| feature_id | uuid, FK → `features.id` | part of composite PK |

Composite primary key `(plan_id, feature_id)`.

**Note:** boolean feature inclusion lives here. Numeric capacity limits (how
many provider seats, patients, staff a plan allows) are a different kind of
data and live in `plan_limits`, section 13.

## 6. `clinics`

The customer accounts. This is the admin system's record of a customer —
not the same table the future clinic-facing app will use for its own
operational data, but it is the record that the future app authenticates
its "is this account allowed" checks against.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | clinic / medical center name |
| clinic_type_id | uuid, FK → `clinic_types.id` | |
| owner_full_name | text | |
| owner_email | text, unique | |
| owner_phone | text | Egyptian format, used for WhatsApp later |
| status | `clinic_status` enum: `trial`, `active`, `past_due`, `suspended`, `cancelled` | |
| notes | text, nullable | internal notes, admin-only |
| created_at | timestamptz | |

## 7. `clinic_subscriptions`

A clinic's current (and historical) plan assignment. A clinic can have more
than one row over time (upgrades, downgrades, renewals) — never update a
past row's period dates, always insert a new one and mark the old one
`status = 'cancelled'`.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid, FK → `clinics.id` | |
| plan_id | uuid, FK → `plans.id` | |
| status | `subscription_status` enum: `trial`, `active`, `past_due`, `cancelled` | |
| price_locked_egp | numeric(10,2) | the price THIS clinic actually pays, captured at the moment this row is created — see note below |
| discount_code_id | uuid, FK → `discount_codes.id`, nullable | which coupon (if any) was applied when this subscription/renewal was created — see section 14 |
| trial_ends_at | timestamptz, nullable | set only when status = trial |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | this is "the renewal date" shown in the dashboard |
| created_at | timestamptz | |

**Why `price_locked_egp` exists:** `plans.price_egp` is the *current list
price shown to new customers*. It is not a live charge amount for existing
subscribers. When a plan's price changes, every clinic already subscribed
to it keeps paying `price_locked_egp` as recorded on their own subscription
row — nothing recalculates automatically. If Ahmed wants to move a specific
clinic to the new price, that's a deliberate action (create a new
subscription row with the new `price_locked_egp`), never an automatic
side-effect of editing the plan. Feature *inclusion* is intentionally the
opposite — it stays live off the current `plan_features` rows, so adding a
feature to a plan reaches everyone on it immediately (see
`lib/entitlements.ts`, Architecture.md section 5). Price is locked, feature
access is live — these are two different, deliberate behaviors, not an
inconsistency.

## 8. `account_feature_overrides`

Per-clinic exceptions to their plan's default feature set.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid, FK → `clinics.id` | |
| feature_id | uuid, FK → `features.id` | |
| override_type | `override_type` enum: `grant`, `revoke` | |
| price_addon_egp | numeric(10,2), nullable | extra monthly charge for a granted add-on feature |
| note | text, nullable | why this override exists |
| granted_by | uuid, FK → `platform_admins.id` | |
| expires_at | timestamptz, nullable | null = permanent until manually removed |
| created_at | timestamptz | |

Effective access computation reads: plan_features for the clinic's active
plan, UNION overrides where `override_type = 'grant'` and not expired,
MINUS overrides where `override_type = 'revoke'` and not expired. This is
implemented once in `lib/entitlements.ts` per Architecture.md section 5.

## 9. `payments`

Manually recorded payments (constraint C-1 — no gateway this phase).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid, FK → `clinics.id` | |
| subscription_id | uuid, FK → `clinic_subscriptions.id`, nullable | |
| amount_egp | numeric(10,2) | |
| payment_method | `payment_method` enum: `bank_transfer`, `cash`, `vodafone_cash`, `instapay`, `other` | |
| status | `payment_status` enum: `pending`, `confirmed`, `failed` | |
| reference_note | text, nullable | e.g. transfer reference number the clinic sent |
| recorded_by | uuid, FK → `platform_admins.id` | |
| paid_at | timestamptz | when the money actually arrived, not when it was logged |
| created_at | timestamptz | when the record was logged |

## 10. `usage_logs`

Read/report only in this phase. Nothing writes to this table yet except
manual test data — the future WhatsApp bot / web app will write here via
`POST /api/v1/usage/report`.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid, FK → `clinics.id` | |
| usage_type | `usage_type` enum: `ai_tokens`, `whatsapp_messages`, `sms` | |
| quantity | numeric | |
| period_month | date | first day of the month this usage belongs to |
| recorded_at | timestamptz | |

## 11. `upgrade_requests`

Inbox for "clinic hit a locked feature and asked to upgrade" — the trigger
lives in a future app, this table and its admin inbox UI exist now.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| clinic_id | uuid, FK → `clinics.id` | |
| feature_id | uuid, FK → `features.id`, nullable | which locked feature triggered this |
| requested_by_name | text, nullable | |
| message | text, nullable | |
| status | `request_status` enum: `open`, `contacted`, `resolved` | |
| created_at | timestamptz | |

## 12. `audit_log`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| actor_admin_id | uuid, FK → `platform_admins.id`, nullable | null if system-generated |
| action | text | e.g. `subscription.plan_changed`, `payment.recorded` |
| target_table | text | |
| target_id | uuid | |
| old_value | jsonb, nullable | |
| new_value | jsonb, nullable | |
| created_at | timestamptz | |

## 13. `plan_limits`

Numeric capacity caps per plan — how many provider seats, patients, and
staff a clinic on this plan is allowed. Separate from `plan_features`
(section 5) because these are quantities, not on/off toggles.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| plan_id | uuid, FK → `plans.id` | |
| limit_type | `plan_limit_type` enum: `provider_seats`, `patients`, `staff_accounts` | |
| max_value | integer, nullable | null = unlimited |

Composite unique constraint on `(plan_id, limit_type)` — a plan has at most
one row per limit type.

**What is a "provider seat"?** One provider seat = one doctor with their own
schedule and their own exam room/chair, regardless of clinic type (a dental
chair and a general-practice exam room are the same billing unit — see
`01_Architecture.md` and `07_Plans_and_Packages_Reference.md` for the
reasoning). A clinic cannot have more active doctors than provider seats
allowed by its plan; enforce this at the point of adding a new doctor in
the future clinic-facing app (not in this admin repo, but the limit data
originates here).

## 14. `discount_codes`

Coupon codes for new-customer promotions and early-renewal incentives.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| code | text, unique | the code the clinic enters, e.g. `WELCOME20` |
| description | text, nullable | internal note on the campaign this belongs to |
| discount_type | `discount_type` enum: `percentage`, `fixed_amount` | |
| discount_value | numeric(10,2) | percentage (0–100) or EGP amount, depending on `discount_type` |
| applies_to | `discount_applies_to` enum: `new_subscription`, `renewal`, `both` | |
| valid_from | timestamptz | |
| valid_until | timestamptz, nullable | null = no expiry |
| max_uses | integer, nullable | null = unlimited uses |
| times_used | integer | default 0, incremented each time it's applied |
| is_active | boolean | default true |
| created_by | uuid, FK → `platform_admins.id` | |
| created_at | timestamptz | |

Applying a code computes the discounted price and that final number is what
gets written to `clinic_subscriptions.price_locked_egp` — the discount
logic runs once, at the moment of creating the subscription row, and the
result is locked in, consistent with the pricing rules in
`02_Rules_and_Constraints.md` section H.

**Early-renewal discount pattern:** this doesn't need a special mechanism —
it's just a `discount_codes` row with `applies_to = 'renewal'`, generated
(manually or, later, automatically) and sent to a specific clinic before
their `current_period_end`. The admin UI for "clinics expiring soon"
(Checkpoint 7) is the natural place to trigger this.

## 15. `announcements`

Marketing/informational messages sent from ClinicOS to clinic customers —
distinct from any patient-facing messaging (which belongs to a different,
future product, not this admin repo — see
`02_Rules_and_Constraints.md` section F).

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| title | text | internal campaign name |
| channel | `announcement_channel` enum: `email`, `whatsapp`, `both` | |
| subject | text, nullable | email subject line; unused for whatsapp-only |
| body | text | message content; supports simple placeholders like `{{clinic_name}}` |
| audience_filter | jsonb | e.g. `{"plan_ids": [...]}`, `{"status": "trial"}`, `{"expiring_within_days": 7}` — resolved into a recipient list when sent |
| status | `announcement_status` enum: `draft`, `scheduled`, `sending`, `sent`, `failed` | |
| scheduled_at | timestamptz, nullable | |
| sent_at | timestamptz, nullable | |
| created_by | uuid, FK → `platform_admins.id` | |
| created_at | timestamptz | |

## 16. `announcement_recipients`

Per-clinic delivery record for an announcement — needed so a failed send
can be identified and retried, and so the same clinic isn't double
messaged.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| announcement_id | uuid, FK → `announcements.id` | |
| clinic_id | uuid, FK → `clinics.id` | |
| channel | `announcement_channel` enum: `email`, `whatsapp` | one row per channel if `announcements.channel = 'both'` |
| status | `delivery_status` enum: `pending`, `sent`, `failed` | |
| error_message | text, nullable | |
| sent_at | timestamptz, nullable | |

## 17. `notifications`

Internal notification center content — for `platform_admins` only. This is
**not** the same as `announcements` (sections 15–16), which goes to clinic
customers externally via email/WhatsApp. This is an in-app inbox for
Ahmed's own team.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| title | text | |
| body | text | |
| notification_type | `notification_type` enum: `manual_broadcast`, `system_event` | `system_event` is reserved for future automated notifications (e.g. a payment recorded) — this phase only implements `manual_broadcast` |
| target_role | `admin_role`, nullable | null = all admins; otherwise only admins with this role receive it |
| link_url | text, nullable | optional in-app link, e.g. to a specific clinic's page |
| created_by | uuid, FK → `platform_admins.id`, nullable | null for future system-generated ones |
| created_at | timestamptz | |

## 18. `notification_recipients`

Per-admin delivery and read-state, mirroring the pattern used for
`announcement_recipients`.

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| notification_id | uuid, FK → `notifications.id` | |
| admin_id | uuid, FK → `platform_admins.id` | |
| read_at | timestamptz, nullable | null = unread |
| created_at | timestamptz | |

## Naming and typing conventions used throughout

- All primary keys: `uuid`, default `gen_random_uuid()`.
- All timestamps: `timestamptz`, UTC.
- All money columns: `numeric(10,2)`, suffixed `_egp`.
- All enums are real Postgres enum types (see each table above for the
  exact enum name), not text + check constraint.
