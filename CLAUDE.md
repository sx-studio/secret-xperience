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
- Supabase publishable key client helpers wired up
- Favorites wired to DB (`favorites` table, `__favSet`, `toggleFavorite`)
- View tracking (`listing_views` table, fires on `openDetail`)
- Saved listings section in dashboard
- Dashboard bug fixes: `price_from/to` (not `price_min/max`), live unread message count, moderation status badges
- CategoryAnimations replaced with design-system handoff (GSAP-driven cards with category routes)
- Homepage JSON-LD fixed — URL is `secretxperience.eu`, Organization schema added alongside WebSite
- BreadcrumbList + Service JSON-LD on all 6 category pages (escorts, nightlife, creators, rentals, hotels, shop)
- `/api/newsletter` POST endpoint + footer signup form on homepage
- `newsletter_subscribers` migration created (`supabase/migrations/20250521_newsletter.sql`) — **needs to be applied in Supabase SQL editor**

## Pending
- **Apply newsletter migration** — `supabase/migrations/20250521_newsletter.sql` not yet run on production DB
- **CCBill integration** — blocked on credentials. Do NOT bring up unless user mentions it first.
- **Stripcash affiliate verification** — draft email response is ready (in chat history), waiting for user to send.
- **Search API** — `/search` not wired to real `listings` table yet
- **Tier expiry display** — featured badge still shows when `tier_expires_at` is past
- **Provider moderation flow** — badges added but full end-to-end flow not verified in browser
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
- `supabase/migrations/` — SQL migrations

## How to verify a change shipped
1. `git push -u origin main` (auto-deploys on Vercel)
2. Check deployment status via GitHub MCP or Vercel dashboard
3. User confirms in browser at secretxperience.eu (hard refresh if needed)
