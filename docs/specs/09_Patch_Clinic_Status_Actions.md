# ClinicOS Admin — Patch: Clinic Status Actions (Suspend / Cancel)

This is a correction to Checkpoint 3, not a new checkpoint.

## Important: there is no "delete a clinic" action, by design

Per `02_Rules_and_Constraints.md` section B, this system never hard-deletes
data — "Soft delete only. No table in this system uses `DELETE`." A
clinic's historical payments, subscriptions, and license records must
never disappear, even if they stop being a customer — for accounting and
audit reasons. So the correct action isn't "delete a clinic," it's
**changing its status**, using the `clinic_status` enum that already
exists on the `clinics` table: `trial`, `active`, `past_due`, `suspended`,
`cancelled`.

If Ahmed's expectation was a true delete button, that's a deliberate
design choice being flagged here, not a bug — confirm with Ahmed that
suspend/cancel is what he actually wants before building anything that
behaves like deletion.

## What's missing and needs to be added

The clinic detail page needs visible actions (buttons, not just a status
badge that can only be set at creation):

1. **Suspend** — sets `clinics.status = 'suspended'`. A suspended clinic's
   license (Checkpoint 11) should also flip to `suspended` in the same
   action — these two states need to move together, not be edited
   separately and risk drifting out of sync.
2. **Cancel** — sets `clinics.status = 'cancelled'` and the current
   `clinic_subscriptions` row's `status` to `cancelled` as well, and the
   linked `clinic_licenses` row to `revoked`.
3. **Reactivate** — sets a `suspended` (not `cancelled`) clinic back to
   `active`, restoring its license to `active`. A `cancelled` clinic
   reactivating should go through creating a *new* subscription (a
   deliberate re-signup), not simply flipping the status back — treat
   `cancelled` as a harder stop than `suspended`.
4. Every one of these actions writes an `audit_log` row (per
   `02_Rules_and_Constraints.md` section B) and requires the confirmation
   step already mandated in section E for destructive actions.

## Role enforcement

Per the role matrix (`02_Rules_and_Constraints.md` section C), `accountant`
can already edit subscriptions — extend that to include these status
actions. `support` stays view-only.

## Acceptance criteria for this patch

- [ ] Suspending a clinic updates both `clinics.status` and its
      `clinic_licenses.status` together, in one action.
- [ ] Cancelling a clinic updates `clinics.status`,
      `clinic_subscriptions.status`, and `clinic_licenses.status`
      together.
- [ ] Reactivating a suspended clinic restores both `clinics.status` and
      `clinic_licenses.status` to active.
- [ ] A cancelled clinic cannot be reactivated directly — the UI guides
      the admin toward creating a new subscription instead.
- [ ] Each action requires a confirmation step and produces an
      `audit_log` row.
- [ ] `support` role cannot trigger any of these actions.
