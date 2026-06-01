# SecretXperience — Project Memory

Read this at the start of every session. Update as state changes.

## What this is
Premium adult services marketplace for the EU (BE/NL/DE/FR/LU primary).
Live at **secretxperience.eu** (and www.secretxperience.eu). Owner email: heyokanaga@gmail.com.

## Stack
- **Next.js 13.5.1** App Router, TypeScript, deployed on **Vercel** (NOT 14 — important for cookie API behavior)
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

## ⚡ Next Session — Resume Here (2026-05-22)
Last thing completed: **Mobile listing card redesign** (commit `40668f5` on `main`).

What was done:
- Homepage listing cards: 2-col grid forced at ALL mobile widths (420px no longer collapses to 1 col)
- Photo slider added per card — prev/next arrows + "1/N" counter, `window.__slideCard` swaps `img#si-{id}` src
- Card hero: full-bleed cover image with gradient overlay, 200px mobile / 175px small phone
- Card body: compact layout — name + price on same row, location below, category label hidden on mobile
- Slider state tracked per card via `window.__sliderIdx`

What's next (user hasn't asked for these yet, don't do proactively):
- The category pages (escorts, nightlife, etc.) have their own card components — they may also need the same mobile 2-col + slider treatment if user requests it
- Pending Supabase migrations still need to be applied (see Pending section)
- CCBill — do NOT mention, waiting on credentials

---

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
- **Escorts page**: Available Now badge (pulsing green), New badge (purple, <7 days), "Sort by availability" option, Discreet Mode toggle (blurs photos, persists localStorage), `isAvailableNow` helper
- **NEW: `/discover`** — GSAP Draggable swipe-to-save page ("Private Gallery"). Swipe right = save to favorites, left = skip. Category filter pills with tabler icons (incl. Verified only + Available tonight). Full portrait cards, styled counter "01 of N portraits", Pass/View/Save action labels, keyboard hints. Linked in homepage nav, drawer, escorts, search, dashboard. Added to sitemap.
- **NEW: `/partners`** — EU adult industry + lifestyle affiliate directory. 50+ curated real businesses across 13 categories. Each card has emoji, name, tagline, badge, description, visit link, affiliate network. Added to sitemap + homepage footer.
- **SliderAds redesign** — Full-height "Velvet Stage" (480px portrait cards), side-peek adjacent cards (72px peek), ambient glow per category, progress bar, category plate label, scrolling ticker rail, touch swipe, click to listing.
- **Login page redesign** — Split-panel layout: atmospheric left (gold orbs, floating particles, brand tagline "An evening that ends behind a closed door") + clean auth form right (Google OAuth with colored G SVG, role selector with tabler icons, shake animation on error, terms checkbox).
- **Tokens/Wallet page redesign** — Hero balance counter (Cormorant Garamond 72px gold), 4-stat row (spent/purchased/tips/balance), 5-tier package grid (Starter/Casual/Connoisseur/Patron/Platinum) with featured card glow + banner, transaction table (Date/Description/Type/Amount/Balance) with tabler icons.
- **Font stack fixed** — `globals.css` `--serif` now leads with `'Cormorant Garamond'` (was Playfair Display) — matches all page-level heading usage.
- **Redundant font imports removed** — Stripped `@import url(fonts.googleapis.com/...)` from all 27 page-level style tags; fonts load once in `layout.tsx`.
- **Mobile improvements** — Viewport export in layout.tsx, single-col breakpoints on search/escorts/tokens, sidebar flex on escorts, touch targets, nav collapse at 640px.
- **Mobile bottom nav** — Swapped Events → Discover (sparkles icon) in the 5-slot bottom nav on homepage.
- **Signup fixed** — New `/api/auth/signup` server route uses service role key to create user + upsert profile + ensure wallet; bypasses failing `auth.users` trigger. Login page now POSTs to this route instead of calling `supabase.auth.signUp()` directly.
- **Identity verification flow fixed (full end-to-end)**:
  - `create_wallet_for_new_user()` trigger: added `SET search_path = public` (was "relation user_wallets does not exist")
  - `identity_verifications` table: granted SELECT/INSERT/UPDATE/DELETE to `service_role` and `authenticated` (table was created without standard Supabase grants)
  - `identity_verifications` FK: added `user_id → public.profiles(id)` so PostgREST can resolve embedded join in admin panel (existing FK pointed to `auth.users`, invisible to PostgREST)
  - File upload: switched from FormData through Vercel (413 too large) to client→Supabase Storage direct upload; route now accepts JSON paths and creates signed URLs server-side
  - Login redirect: `/login?redirect=` → `/login?next=` to match login page's param reader
  - `.single()` → `.maybeSingle()` on `identity_verifications` in dashboard and listings/create
  - Admin panel verification tab now shows all pending submissions with profile data
- **Platform-wide audit fixes (2026-05-22)**:
  - `@supabase/ssr` cookie adapter: ALL routes now use `getAll/setAll` pattern (tokens/spend, featured-boost were still on old `get`-only)
  - `favorites` and `listing_views` tables: created with proper schema, RLS, FKs, grants via migration
  - service_role grants: every core table now has full SELECT/INSERT/UPDATE/DELETE for service_role
  - Wallet security: authenticated role CANNOT INSERT/UPDATE/DELETE user_wallets — only service_role (prevents balance manipulation)
  - Admin verification approval: added `admin update all verifications` RLS policy so admin can approve/reject from browser client
  - Admin notifications: added `admin insert notifications` RLS policy so approve/reject sends user notification
  - Duplicate RLS policies cleaned up (listings, profiles, messages had redundant duplicate policies)
  - Listing detail, tokens/spend: `.single()` → `.maybeSingle()` where row absence is possible
  - Upload size cap: 4MB (was 10MB, Vercel limit is 4.5MB — prevents silent 413)
  - Search query: special chars sanitized before embedding in PostgREST `.or()` filter
  - Admin client auth options: `{ autoRefreshToken: false, persistSession: false }` on all service_role clients
  - `app/api/tokens/spend/route.ts`: cookie adapter fixed + admin client hardened
  - `app/api/featured-boost/route.ts`: cookie adapter fixed
  - Next.js version confirmed as **13.5.1** — `cookies()` is synchronous (no `await`), important for all server code

## Pending
- **Apply `20260601_signup_attribution.sql`** — creates `signup_sources` (service-role-only RLS) for the Admin → Acquisition tab. Without it, signups can't be attributed and the Acquisition tab errors.
- **Apply pending migrations in Supabase SQL editor** (run in order):
  - `20250521_newsletter.sql` ✓ already applied
  - `20250521_tier_auto_expire.sql` (requires pg_cron)
  - `20250521_search_indexes.sql` (requires pg_trgm)
  - `20250521_bookings.sql` (if bookings table doesn't exist yet)
  - `20250521_messages.sql` (if messages table doesn't exist yet)
- **CCBill integration** — blocked on credentials. Do NOT bring up unless user mentions it first.
- **Stripcash affiliate verification** — draft email response is ready (in chat history), waiting for user to send.
- **secretxperience.eu deployment visibility** — user has reported latest changes sometimes don't appear; could be browser cache (Ctrl+Shift+R) or Vercel domain alias issue.

## Nice-to-do (not yet requested but noted)
- Events page not in mobile bottom nav (swapped for Discover) — if user wants both, consider a 6th slot or a "More" overflow menu
- Consider a post-booking satisfaction survey flow in dashboard

## Critical patterns (don't break these)
- `cookies()` from `next/headers` is **synchronous** in Next.js 13.5.1 — NEVER `await cookies()`
- Supabase SSR cookie adapter MUST use `{ cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }` — never the old `{ cookies: { get: (n) => ... } }` pattern
- Admin client (service_role) MUST include `{ auth: { autoRefreshToken: false, persistSession: false } }` 
- `.single()` is fine when followed by a null/error check; use `.maybeSingle()` when you want to silently ignore missing rows
- Wallet balance mutations ONLY via service_role routes — never via authenticated browser client (RLS enforces this now)

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
- `app/components/SliderAds/SliderAds.tsx` — featured ad slider (Velvet Stage, 480px, side-peek)
- `app/globals.css` — global CSS variables (--serif, --sans, design tokens)
- `app/sitemap.ts`, `app/robots.ts` — SEO
- `app/api/newsletter/route.ts` — newsletter subscription
- `app/api/notify/route.ts` — booking notification emails (Resend)
- `app/api/bookings/request/route.ts` — meetup-only booking for escort categories (no payment)
- `app/api/checkout/route.ts` — Stripe checkout for payable categories (rentals, hotels, events, shop)
- `app/api/webhooks/stripe/route.ts` — Stripe webhook: confirms bookings, activates featured boosts
- `app/discover/page.tsx` — swipe-to-save discover page (GSAP Draggable, "Private Gallery")
- `app/partners/page.tsx` — EU adult industry + lifestyle affiliate directory
- `app/login/page.tsx` — split-panel auth page (atmospheric left, form right)
- `app/tokens/page.tsx` — wallet/tokens page (hero counter, packages, transaction ledger)
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
