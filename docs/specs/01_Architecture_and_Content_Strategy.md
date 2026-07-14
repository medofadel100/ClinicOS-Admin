# ClinicOS Marketing Site — Architecture & Content Strategy

Status: MVP phase 1
Owner: Ahmed

## 1. Purpose

A public marketing website — the first thing a doctor sees before they're
a customer. Separate project, separate repo (`ClinicOS Marketing Site`,
sibling to Admin/Web/WhatsApp Service). This is not a login-gated app; it's
a small set of public pages optimized for being read, trusted, and acted
on (request a demo / start a trial).

## 2. Tone: the "respects the doctor's intelligence" rule

Ahmed asked for marketing that's strong but doesn't insult a doctor's
intelligence. Concretely, that means:

- **No fake urgency, no inflated claims, no stock-photo doctors smiling at
  a tablet.** A doctor reading this has seen a hundred SaaS landing pages
  that all promise "revolutionize your clinic." That phrase is banned from
  this site.
- **Specific over vague.** Not "save time" — "a rule-based WhatsApp bot
  that books, reschedules, and cancels appointments without you paying for
  AI tokens you don't need." Not "powerful reports" — "know exactly which
  service line is actually profitable this month."
- **Show the mechanism, not just the promise.** Doctors are analytical
  people. Explaining *how* the offline sync works, or *how* feature-based
  pricing avoids paying for a whole tier just to unlock one thing, builds
  more trust than a bold claim would.
- **Acknowledge real tradeoffs.** E.g. honestly note that the AI WhatsApp
  bot is a paid tier, not "unlimited AI for everyone" — a doctor who
  catches one inflated claim stops trusting the rest of the page.
- **Arabic primary, professional register (فصحى مبسطة, not slang)** — this
  is a credibility document, not a social post. English version available
  but Arabic is the primary audience given the target market (Egypt).

## 3. Site structure (pages)

1. **Home** — hero, the core problem/solution framing, 3–4 standout
   features with the "how it works" specificity, a comparison-of-approach
   section (not attacking named competitors, but honestly explaining what
   makes the pricing/offline/bot design different), and a CTA.
2. **Features** — a fuller breakdown, organized by the same modules used
   internally (scheduling, billing, inventory, payroll, WhatsApp bot,
   offline app) so the site's structure mirrors the actual product,
   not a fictional feature list dreamed up separately.
3. **Pricing** — describes the plan structure (Basic/Professional/
   Advanced/Offline) and what changes between them, without necessarily
   showing final EGP numbers if Ahmed prefers a "request pricing" flow —
   confirm with Ahmed which approach before building; either is fine
   structurally.
4. **Request a demo / Start trial** — a lead capture form. Submitting it
   writes a row to a new `marketing_leads` table in the **same shared
   Supabase project** as ClinicOS Admin (see section 5) so Ahmed's team
   sees it in one place, not a separate inbox.
5. **About / Contact** — short, real, no fluff.

## 4. Tech

Plain Next.js 14 (App Router), static/SSG where possible for speed and
SEO, Tailwind. No auth, no complex client state. This is the one ClinicOS
project that genuinely doesn't need Supabase Auth or RLS-scoped data
except for the one lead-capture write (section 5) and the one clinic-type
read (section 5).

next-intl for `/ar` and `/en`, same reasoning as ClinicOS Web (public
site, needs proper locale routing, not the lightweight Admin approach).

Hosting: Vercel, same as the other two apps.

## 5. The one piece of shared data: leads

### `marketing_leads` (new table, same Supabase project as ClinicOS Admin)

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| full_name | text | |
| clinic_name | text | |
| phone | text | |
| email | text, nullable | |
| clinic_type_id | uuid, FK → `clinic_types.id`, nullable | dropdown populated from the real `clinic_types` table — the marketing site reads this table (public, read-only) so the list is never out of sync with what the product actually supports |
| message | text, nullable | |
| status | `lead_status` enum: `new`, `contacted`, `converted`, `not_interested` | |
| created_at | timestamptz | |

This table needs RLS too: public (anonymous) `INSERT` only, no `SELECT`
from the public/anon role — only `platform_admins` can read leads, via a
simple leads inbox added to ClinicOS Admin (a small follow-up task there,
not part of this repo). This site never reads clinic data, patient data,
or anything beyond `clinic_types` (for the dropdown) and its own
`marketing_leads` inserts.

## 6. What this project does NOT do

- No login, no dashboard, no patient/clinic operational data.
- No blog/CMS in this phase — static content pages are enough to start.
- No payment collection on this site — pricing page informs, it doesn't
  transact.
