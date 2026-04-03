# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run format       # Format code with Prettier
npm run format:check # Check formatting without writing
```

Run a single test file:
```bash
npx vitest run tests/stripe-webhook.test.ts
```

## Architecture

This is an **Astro SSR app** (server-side rendered, not static) deployed on Netlify. It's an event ticketing site for "Bring Your Own Cake" club in Boise, ID.

**Key integration points:**
- **Stripe** → payment processing. Checkout session creates a ticket; webhook (`netlify/functions/stripe-webhook.ts`) receives the `checkout.session.completed` event, generates a `TCKT-XXXXXXXX` code, stores it in Supabase, and emails a QR code via Resend.
- **Supabase** → stores the `tickets` table (see `database-migration.sql` for schema).
- **Resend** → transactional email (ticket confirmation with QR code, welcome emails).

**API routes** (`src/pages/api/`):
- `staff-auth.ts` / `verify-session.ts` — simple password-based staff portal auth
- `verify-ticket.ts` — looks up a ticket code; returns ticket info
- `redeem-ticket.ts` — marks a ticket as redeemed (sets `redeemed_at`)
- `send-welcome-email.ts` — email signup endpoint

**Dev vs. production mode:** All API routes check for `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` at runtime. When those env vars are absent, routes fall back to in-memory mock data (`src/lib/mock-tickets.js`) so the staff portal and ticket verification work locally without a real database.

**Netlify function** (`netlify/functions/stripe-webhook.ts`) runs outside Astro's request cycle. It tries `STRIPE_WEBHOOK_SECRET` first, then falls back to `STRIPE_WEBHOOK_SECRET_DEV` if the first fails.

## Environment Variables

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Production webhook signing secret |
| `STRIPE_WEBHOOK_SECRET_DEV` | (Optional) Dev webhook signing secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Resend email API key |
| `RESEND_AUDIENCE_BOISE_ID` | (Optional) Resend audience ID for Boise signups |
| `RESEND_AUDIENCE_SLC_ID` | (Optional) Resend audience ID for SLC signups |
| `MAIL_FROM` | Sender email address |
| `STAFF_PASSWORD` | Password for staff portal (use `cake2024` locally) |

For local dev without Supabase/Stripe, only `STAFF_PASSWORD` is required.

## Dev Mode Sample Tickets

When no Supabase credentials are set, these codes work for testing:
`TCKT-JANE2024`, `TCKT-JOHN2024`, `TCKT-BOB2024` (valid), `TCKT-MARY2024`, `TCKT-SARAH2024` (already redeemed).
