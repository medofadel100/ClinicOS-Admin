# ClinicOS Admin — Patch: Editable Plans & Feature Catalog

This is a correction to Checkpoint 2, not a new checkpoint. Checkpoint 2's
deliverable was "CRUD UI" for clinic types, features, and plans — CRUD
means Create, Read, **Update**, and Delete (soft-delete, per
`02_Rules_and_Constraints.md`). The current build only has Create and
Read. This patch closes that gap.

## What's missing and needs to be added

1. **Plans**: an edit form (or inline edit) on the plans list/detail page
   letting a super_admin change `name_ar`, `name_en`, `price_egp`,
   `billing_cycle`, and `is_active`. Editing `price_egp` must **not**
   retroactively change any existing clinic's `price_locked_egp` — this is
   the exact rule already documented in
   `02_Rules_and_Constraints.md` section I ("Price changes never
   retroact") and tested by an acceptance criterion in Checkpoint 3. If
   if that protection isn't already in place, verify it now as part of this
   patch, don't assume it's fine just because it wasn't asked about explicitly
   before.
2. **Plan limits**: the provider-seat/patient/staff limits per plan
   (`plan_limits`) need the same edit capability — currently these seem to
   only be set at creation time based on Ahmed's description.
3. **Plan-feature bundling**: the ability to add/remove which features are
   bundled into a plan after the plan already exists (editing
   `plan_features` rows, not just setting them once at creation).
4. **Feature Catalog**: an edit form for `features` — `name_ar`,
   `name_en`, `description_ar`, `description_en`, `category`,
   `base_price_egp`, `applicable_clinic_type_ids`, `is_active`.
5. **Clinic Types**: confirm the same edit capability exists here too
   (Ahmed didn't report this one as broken, but verify while you're in
   this area of the code rather than assuming).

## Role enforcement (unchanged from the original spec)

All of the above stays `super_admin`-only to edit, per the role matrix in
`02_Rules_and_Constraints.md` section C — `accountant` and `support` keep
view-only access. Don't loosen this while fixing the edit forms.

## Acceptance criteria for this patch

- [ ] A super_admin can edit an existing plan's price, name, billing
      cycle, and active status, and the change is reflected immediately in
      the plans list.
- [ ] A super_admin can edit an existing plan's provider-seat/patient/
      staff limits.
- [ ] A super_admin can add or remove a feature from an existing plan's
      bundle after creation.
- [ ] A super_admin can edit an existing feature's name, description,
      category, price, and clinic-type applicability.
- [ ] Editing a plan's price does NOT change `price_locked_egp` on any
      existing clinic's subscription — re-verify this explicitly as part
      of this patch, with a real test: edit a plan's price, then check an
      existing subscribed clinic's locked price is unchanged.
- [ ] `accountant` and `support` roles still cannot edit any of the above
      (view-only), confirmed via RLS, not just hidden buttons.
