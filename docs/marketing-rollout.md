# SecretXperience — Marketing Rollout Checklist

Where to list/advertise the platform, in priority order, with ready-to-use
UTM-tagged links so the **Admin → Acquisition** tab can tell you which channel
actually drives signups.

> Skip Google Business Profile and Meta/Google Ads — they ban adult-services
> promotion and will suspend the linked account. Everything below is
> adult-friendly.

---

## How tracking works (do this once, then it's automatic)

1. Append UTM params to **every** link you place on a directory or buy from an
   ad network. Template:

   ```
   https://www.secretxperience.eu/?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
   ```

2. Conventions (keep them consistent or the report fragments):
   - `utm_source` — the platform, lowercase, no spaces: `slixa`, `erobella`, `exoclick`, `trafficjunky`
   - `utm_medium` — the channel type: `directory`, `cpc`, `banner`, `native`, `social`, `forum`
   - `utm_campaign` — what you're running: `launch`, `de-escorts`, `q3-promo`

3. First-touch is captured into a cookie on landing and recorded against the
   signup. View results in **Admin → Acquisition** (source · medium · campaign ·
   signups · last signup), exportable to CSV.

   - Direct/unknown visits stay untracked (won't pollute the report).
   - **Known limitation:** Google-OAuth signups skip the email/password signup
     route, so they aren't attributed yet. Email/password signups are.

---

## Priority 1 — Do these first (high traffic, your exact markets)

- [ ] **Erobella / Ladies.de (DE)** — Germany is the largest legal EU market.
  `?utm_source=erobella&utm_medium=directory&utm_campaign=de-launch`
- [ ] **Redlights (BE/NL)** — dominant Benelux platform; your core competitor.
  `?utm_source=redlights&utm_medium=directory&utm_campaign=benelux-launch`
- [ ] **Kinky.nl / Kinky.be** — large Benelux adult directory + classifieds.
  `?utm_source=kinky&utm_medium=directory&utm_campaign=benelux-launch`
- [ ] **Slixa** — premium/"luxury companion" positioning, best brand fit.
  `?utm_source=slixa&utm_medium=directory&utm_campaign=launch`
- [ ] **EuroGirlsEscort (EGE)** — pan-EU, very high traffic.
  `?utm_source=ege&utm_medium=directory&utm_campaign=launch`

## Priority 2 — Premium / brand-fit directories

- [ ] **Tryst.link** — independent-focused, clean, premium audience.
  `?utm_source=tryst&utm_medium=directory&utm_campaign=launch`
- [ ] **TER (The Erotic Review)** — review-driven, premium.
  `?utm_source=ter&utm_medium=directory&utm_campaign=launch`
- [ ] **Kaufmich / Markt.de (DE)** — high-volume German directories.
  `?utm_source=kaufmich&utm_medium=directory&utm_campaign=de-launch`
- [ ] **Skokka** — pan-EU classifieds (ES/IT/PT volume).
  `?utm_source=skokka&utm_medium=directory&utm_campaign=launch`

## Priority 3 — Per-market classifieds (as you expand country by country)

- [ ] **Vivastreet / Wannonce / 6annonce (FR)**
  `?utm_source=vivastreet&utm_medium=directory&utm_campaign=fr-launch`
- [ ] **Escortforumit (IT)**, **Escort-Spain (ES)**, **Escort-Ireland (IE)**
  `?utm_source=escortforumit&utm_medium=directory&utm_campaign=it-launch`

---

## Ad networks (paid traffic — start small, measure, then scale)

Use only the large, legit networks. Start each with a small test budget, watch
the Acquisition tab for **real signups** (not just clicks), scale what converts.

- [ ] **EroAdvertising** — NL-based, strong in BE/NL/DE (your primary markets).
  `?utm_source=eroadvertising&utm_medium=banner&utm_campaign=test-1`
- [ ] **ExoClick** — EU-based (Barcelona), excellent geo-targeting.
  `?utm_source=exoclick&utm_medium=banner&utm_campaign=test-1`
- [ ] **TrafficJunky** — Aylo/Pornhub inventory, massive reach.
  `?utm_source=trafficjunky&utm_medium=banner&utm_campaign=test-1`
- [ ] **TrafficStars** — large EU network (pop, native, banners).
  `?utm_source=trafficstars&utm_medium=native&utm_campaign=test-1`
- [ ] **JuicyAds** — established self-serve, good for cheap testing.
  `?utm_source=juicyads&utm_medium=banner&utm_campaign=test-1`

---

## Free / organic channels

- [ ] **X/Twitter** — adult-friendly; build a brand presence.
  `?utm_source=twitter&utm_medium=social&utm_campaign=organic`
- [ ] **Reddit** (relevant NSFW subs, within each sub's rules).
  `?utm_source=reddit&utm_medium=social&utm_campaign=organic`
- [ ] **Adult forums** — community referral traffic.
- [ ] **Adult-niche link building** — guest posts/listings on adult blogs; this
  is where "escort [city]" domain authority comes from.

---

## Cautions

- **Vet for bot traffic** on every ad network — start small, scale only on real
  signups.
- **Payments/compliance** — most adult networks require an adult-merchant setup.
- **GDPR** — keep consent/cookie handling clean before pouring paid traffic in.
- `/partners` (on the site) is the *outbound affiliate* directory (businesses we
  link out to) — not the same as this list (where *we* get listed).
