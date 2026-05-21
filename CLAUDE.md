# SecretXperience — Project Memory

Read this at the start of every session. Update as state changes.

## What this is
Premium adult services marketplace for the EU (BE/NL/DE/FR/LU primary).
Live at **secretxperience.eu** (and www.secretxperience.eu). Owner email: heyokanaga@gmail.com.

## Stack
- **Next.js 14** App Router, TypeScript, deployed on **Vercel**
  - Team: `team_8bUh79wAVTN5pyFKcCQGIXEy`
  - Project: `prj_uE7mmweTEj1NwLhddYWXiI1Pbw1T`
  - Auto-deploys on push to `main`
- **Supabase** project `duwuzaelmggldhkgoebn` — auth, DB, RLS, pg_cron, storage
  - Using publishable key `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (replaces deprecated anon key)
- **Resend** for transactional email (set `RESEND_API_KEY` in Vercel to enable)
- GSAP 3.12.5 from CDN for category animations

## Branch policy
**Develop on `main`.** User has explicitly said multiple times: only make changes on the main branch. Every commit auto-deploys to production.

## Architecture quirks (important — don't re-learn these)
- `app/page.tsx` uses massive `dangerouslySetInnerHTML` for the homepage layout. React components (SliderAds, CategoryAnimations) are mounted into placeholder `<div id="...">` nodes via `createPortal` + `useEffect`.
- The CategoryAnimations mount point (`#catAnimsMount`) MUST sit OUTSIDE `<main class="main">` and BEFORE `<div class="layout">` so it's full-width above the sidebar/listings split.
- Static HTML in `dangerouslySetInnerHTML` is built at compile time — any `${var}` reference inside it must use variables that exist at JSX render scope, NOT inside useEffect-only scope. Heart buttons (`data-fav-lid`) go in the dynamic `renderCards` useEffect, NOT in the static template.
- Provider/listing card category routes: `escorts → /escorts`, `companions → /companionship`, `nightlife → /nightlife`, `creators → /creators`, `rentals → /rentals`, `hotels → /hotels`, `events → /events`, `shop → /shop`.

## Done (recent work, don't redo)
- Token system migrations applied (`token_packages`, `user_wallets`, `token_ledger`, `payment_orders`)
- Identity verification table + flow (`identity_verifications`)
- Auto-expire pg_cron job
- Supabase publishable key client helpers wired up; ALL pages/routes now use `PUBLISHABLE_KEY || ANON_KEY` fallback
- Favorites wired to DB (`favorites` table, `__favSet`, `toggleFavorite`)
- View tracking (`listing_views` table, fires on `openDetail`)
- Saved listings section in dashboard
- Dashboard bug fixes: `price_from/to` (not `price_min/max`), live unread message count, moderation status badges
- CategoryAnimations replaced with design-system handoff (GSAP-driven cards with category routes)
- Homepage JSON-LD fixed — URL is `secretxperience.eu`, Organization schema added alongside WebSite
- BreadcrumbList + Service JSON-LD on all 6 category pages (escorts, nightlife, creators, rentals, hotels, shop)
- `/api/newsletter` POST endpoint + footer signup form on homepage
- Search page: publishable key, sanitized q, subcategory scope, client-side relevance bump, **pagination** (24/page), **advanced filters** (verified-only, meet type, price range), **Available Now badge**
- Tier expiry: `expire_listing_tiers()` + hourly pg_cron sweep (migration pending)
- Search performance indexes: pg_trgm GIN (migration pending)
- CategoryAnimations: dangerouslySetInnerHTML split in two with `<CategoryAnimations />` direct JSX. No portal.
- Newsletter signup: working end-to-end
- Provider moderation: fixed column name, badges work
- Messages: search filter, unread count fixed, read receipts on open
- Listing detail: favorites toggle, duplicate CTA removed
- All API routes: `www.secretxperience.eu` fallback
- Bookings/messages migrations in version control
- Security: token spend blocking, PII logging removed, moderation auth hardened
- Price filter bug fixed in `/api/listings/search` (`price_to` not `price_from`)
- Webhook: sends `listing_boosted` email notification after boost
- **Dashboard improvements**: client vs provider bookings split, inline Confirm/Decline for providers, listing join for booking title, token balance stat card, profile completeness progress bar (auto-hides at 100%), listing view counts from `listing_views`, Discover quick-action
- **Tokens page**: transaction ledger shows last 15 entries with type/amount/balance
- **Escorts page**: Available Now badge (pulsing green), New badge (purple, <7 days), "Sort by availability" option, Discreet Mode toggle (blurs photos, persists localStorage), `isAvailableNow` helper
- **NEW: `/discover`** — GSAP Draggable swipe-to-save page. Swipe right = save to favorites, left = skip. Category filters. Full portrait cards with price/verified badges. Linked in homepage nav, drawer, escorts, search, dashboard. Added to sitemap.

## Pending
- **Apply pending migrations in Supabase SQL editor** (run in order):
  - `20250521_newsletter.sql` ✓ already applied
  - `20250521_tier_auto_expire.sql` (requires pg_cron)
  - `20250521_search_indexes.sql` (requires pg_trgm)
  - `20250521_bookings.sql` (if bookings table doesn't exist yet)
  - `20250521_messages.sql` (if messages table doesn't exist yet)
- **CCBill integration** — blocked on credentials. Do NOT bring up unless user mentions it first.
- **Stripcash affiliate verification** — draft email response is ready (in chat history), waiting for user to send.
- **secretxperience.eu deployment visibility** — user has reported latest changes sometimes don't appear; could be browser cache (Ctrl+Shift+R) or Vercel domain alias issue. Worth checking deployments list via Vercel dashboard if it recurs.

## Constraints / things NOT to do
- Don't push to non-main branches without explicit permission
- Don't install local CLIs in this container — it's ephemeral, they won't survive
- Don't bring up CCBill — waiting on credentials
- Don't claim a UI change works without verifying (user has called this out before)
- Don't add comments explaining "what" the code does — only "why" if non-obvious

## Useful files
- `app/page.tsx` — homepage (huge, mixed JSX + dangerouslySetInnerHTML)
- `app/lib/supabase.ts` — browser client
- `middleware.ts` — uses publishable key
- `app/components/CategoryAnimations/` — animated category cards
- `app/sitemap.ts`, `app/robots.ts` — SEO
- `app/api/newsletter/route.ts` — newsletter subscription
- `app/api/notify/route.ts` — booking notification emails (Resend)
- `app/api/bookings/request/route.ts` — meetup-only booking for escort categories (no payment)
- `app/api/checkout/route.ts` — Stripe checkout for payable categories (rentals, hotels, events, shop)
- `app/api/webhooks/stripe/route.ts` — Stripe webhook: confirms bookings, activates featured boosts
- `app/discover/page.tsx` — NEW swipe-to-save discover page (GSAP Draggable)
- `supabase/migrations/` — SQL migrations

## Payment category rules (IMPORTANT)
- **Meetup-request only** (no card payment): escorts, companionship, massage, domination, experiences, nightlife, creators
- **Card payable via Stripe**: rentals, hotels, events, shop
- Enforced at BOTH client and server level. Never allow card payment for escort/sexual services.

## Key env vars (must be set in Vercel)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — replaces ANON_KEY (or set both)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, admin operations
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — payment processing
- `INTERNAL_SECRET` AND `NEXT_PUBLIC_INTERNAL_SECRET` — must match, used for internal API calls (moderation, notify)
- `RESEND_API_KEY` — email sending (optional, logs to console if absent)
- `ANTHROPIC_API_KEY` — AI moderation (auto-approves listings if absent)

## How to verify a change shipped
1. `git push -u origin main` (auto-deploys on Vercel)
2. Check deployment status via GitHub MCP or Vercel dashboard
3. User confirms in browser at secretxperience.eu (hard refresh if needed)
