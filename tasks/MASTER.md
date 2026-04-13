# santedesigns.com -- Master Plan

*Last updated: 2026-04-13 (major update: e-commerce research complete, 3 options finalized)*

---

## 1. Project Overview

Custom static website for fashion/graphics designer **Sante**, replacing an expensive Shopify store. Vanilla HTML/CSS/JS with GSAP animations, hosted on GitHub Pages for $0/mo. E-commerce approach narrowed to three options (see Section 4). Live repo at `github.com/YG4PRESIDENT/santedesigns.com` -- custom domain not yet purchased.

**Key constraint:** Sante does not have an SSN or ITIN. The payment account will be set up under Yahir's name as a bridge until Sante obtains an ITIN (7-14 week IRS process). Long-term goal: transfer everything to Sante's own accounts.

---

## 2. What's Done

### Site & Design
- 9 pages built: index, archive, product, lookbook, story, donate, oneofone, sound, drop
- 3 legal pages: terms, privacy, shipping
- Luxury font pairing: UnifrakturCook (display), Pirata One (nav), Inconsolata (body)
- Left push sidebar nav (25% width, GSAP-animated)
- White background portal with stretched "Sante" logo (Impact)
- Full-bleed color scheme: black/white + lime green `#4cff16` accent
- 2x2 shop grid on archive page
- Split-screen product detail (sticky image / scrolling details)
- NAMI + JED Foundation on donate page with real logos
- Instagram official SVG logo on all pages
- Sound & Drop removed from nav

### JS & Animation
- GSAP + ScrollTrigger: marquee, scroll reveals, hover effects
- ES modules with try/catch per module (graceful degradation)
- Reduced-motion support throughout
- Snipcart script tags on all pages (TO BE REMOVED -- switching to Shopify Buy Button or Stripe)
- All audit bugs fixed (sidebar overlap, missing `</div>`, GSAP conflicts, etc.)

### Accessibility
- `focus-visible` on all interactive elements
- `prefers-reduced-motion` disables GSAP
- Skip-to-content CSS ready (HTML tags still needed)
- WCAG keyboard focus on hover-scale

### Infrastructure
- Git repo initialized, pushed to GitHub
- `.gitignore`, `robots.txt`, `sitemap.xml`, `netlify.toml`
- Admin/payments research complete, Firebase spec written
- 4 admin prototype HTML files built

---

## 3. Waiting on Sante (Checklist)

- [ ] Favicon (champagne clinking image)
- [ ] Our Story bio text for `story.html`
- [ ] ITIN application -- Sante needs to apply via Form W-7 through a Certified Acceptance Agent (free from IRS, CAA may charge $50-200, takes 7-14 weeks). Needs passport or matrícula consular. This unlocks: own Stripe/Shopify account, own bank account, path to LLC/EIN.
- [ ] Payment decision -- see Section 4 (narrowed to 3 options, Sante needs to pick)
- [ ] Homepage centerpiece visual (hero photo or video)
- [ ] Real product photos, names, prices, descriptions (replace all `[PLACEHOLDERS]`)
- [ ] Instagram handle (footer/nav currently links to `instagram.com/` with no handle)
- [ ] Domain purchase -- `santedesigns.com` (~$10-12/yr), then wire GitHub Pages CNAME + SSL

---

## 4. Payment / E-Commerce Plan

### Context: Why Not Snipcart?

Snipcart was the original plan in CLAUDE.md. After extensive research (11 agents, 7 platforms evaluated), it was eliminated:
- **$20/month minimum** even with zero sales -- unacceptable for a pre-revenue brand
- Total effective fee of **4.9% + $0.30** (2% Snipcart + 2.9% Stripe) is higher than most alternatives
- Sante's situation (no SSN/ITIN) means he can't hold the account himself anyway

### Context: Why Not Other Platforms?

| Platform | Why It's Out |
|----------|-------------|
| **Snipcart** | $20/mo minimum, high fees |
| **Gumroad** | 10% fee, no multi-item cart, can't style checkout, no physical product cart |
| **Lemon Squeezy** | Does not support physical products at all |
| **Ecwid** | Fashion variants (size/color) require $49+/mo Business plan |
| **Square** | Checkout can't be styled, better for in-person POS |
| **Headless (Medusa, Saleor)** | Requires hosting a backend ($10-50/mo), ongoing DevOps -- overkill |
| **Stripe Checkout Sessions** | Requires a server (Cloudflare Worker) -- adds complexity |

### The Three Finalists

#### Option A: Venmo / Cash App (DM Sales) -- $0/month

**How it works:** Instagram post -> customer DMs -> pays via Venmo/CashApp -> Sante ships.

| Aspect | Details |
|--------|---------|
| Monthly cost | $0 |
| Transaction fee | Venmo Business: 1.9% + $0.10. CashApp Business: 2.75% |
| On a $150 sale | Venmo: keep $147.15. CashApp: keep $145.88 |
| SSN/ITIN needed? | No for basic accounts. Limits: $299/wk Venmo, $250/wk CashApp without verification |
| Sante independent? | Yes -- his own accounts |
| Yahir tax burden? | None |
| Website integration | Payment link + QR code. Not a real checkout. Customer types amount manually. |

**Pros:**
- Free, instant, zero setup -- can start today
- Standard in streetwear culture (not unprofessional for this niche)
- Sante owns everything, no dependency on Yahir
- Builds personal customer relationships through DMs
- Tests demand before investing in infrastructure
- 1099-K threshold is $20K + 200 transactions (restored by One Big Beautiful Bill Act, July 2025)

**Cons:**
- Without ITIN: $299/week Venmo cap (~2 sales/week at $150)
- Every sale is manual DM back-and-forth
- No cart, no checkout, no automation, no inventory tracking
- Can't scale past ~20-30 orders/week
- Can't run paid ads (no checkout page to link to)
- Venmo can freeze accounts if they detect commercial activity on personal accounts
- No buyer protection on CashApp/Zelle

#### Option B: Shopify Starter ($5/month) via Yahir -- RECOMMENDED

**How it works:** Yahir sets up Shopify with his SSN. Sante manages products from the Shopify app on his phone. Buy Buttons embedded on the GitHub Pages site. Cart overlay on site -> checkout redirects to Shopify.

| Aspect | Details |
|--------|---------|
| Monthly cost | $5 |
| Transaction fee | 5% all-in (includes credit card processing) |
| On a $150 sale | Keep ~$142.20-$142.50 |
| SSN/ITIN needed? | Yahir's SSN only |
| Sante independent? | YES -- manages products, prices, images, orders, discounts from phone |
| Yahir tax burden? | Moderate -- income on Yahir's return, offset with payments to Sante |
| Website integration | Buy Button SDK. Renders in YOUR DOM with `iframe: false`. Cart overlay. |

**Pros:**
- Sante is fully independent: change prices at 2am from phone, add products, mark sold out, view orders
- Live price sync: Sante changes price in app -> site auto-updates. ONE source of truth
- Real multi-item cart (customer adds tee + hoodie -> single checkout)
- Abandoned cart recovery emails (automatic, recovers 5-15% of lost sales)
- Apple Pay / Google Pay / Shop Pay (100M+ users, one-tap checkout)
- Full order management dashboard (fulfill, track, email customers)
- Discount codes from the app
- Inventory tracking per variant (size/color)
- Buy Button with `iframe: false` inherits site CSS -- can match black/#4cff16 aesthetic
- Works perfectly on GitHub Pages

**Cons:**
- 5% fee is steep ($7.50 on $150 vs $4.65 on Stripe). Extra ~$2.85/sale
- $5/month even with zero sales
- Checkout redirects to myshopify.com ("Powered by Shopify" in footer)
- No staff accounts on Starter (Sante + Yahir share login or use collaborator workaround)
- No shipping label discounts (need Basic at $39/mo)
- At 11+ orders/month ($150 avg), upgrade to Basic ($39/mo, 2.9% rate)
- Tax: income on Yahir's return; can't cleanly issue 1099-NEC to Sante without his tax ID

#### Option C: Stripe Payment Links ($0/month) via Yahir

**How it works:** Yahir sets up Stripe with his SSN. Creates Payment Links in Dashboard. Links embedded on site. Google Sheet for product display data.

| Aspect | Details |
|--------|---------|
| Monthly cost | $0 ($10/mo optional for custom checkout domain) |
| Transaction fee | 2.9% + $0.30 |
| On a $150 sale | Keep $145.35 |
| SSN/ITIN needed? | Yahir's SSN only |
| Sante independent? | Partially -- edits Google Sheet but can't create Payment Links from phone |
| Yahir tax burden? | Moderate -- same as Shopify. Stripe ToS also explicitly prohibits third-party account use. |
| Website integration | Links/buttons on site -> Stripe checkout page. Styleable: black bg, #4cff16 buttons, logo. |

**Pros:**
- $0/month -- only pay when something sells
- Lowest per-transaction fee (2.9% + $0.30)
- Checkout customization (black background, neon green, logo, custom domain)
- Apple Pay / Google Pay automatic
- Promo codes supported

**Cons:**
- NO multi-item cart (each product = separate checkout, card entered twice)
- Variant nightmare: 10 products x 4 sizes = 40 Payment Links to manage
- 3-step price change: update Stripe -> new Payment Link -> paste URL in Google Sheet. Can't do from phone.
- No abandoned cart emails
- No order management (just a payments list)
- No inventory tracking
- Stripe ToS explicitly prohibits third-party account use (low enforcement risk at small volume, but real)
- Google Sheets workflow is "barely manageable" for a non-technical person

### Head-to-Head Comparison

| | Venmo/CashApp | Shopify Starter | Stripe via Yahir |
|---|---|---|---|
| Monthly cost | $0 | $5 | $0 |
| Fee on $150 sale | $2.85 | $7.50 | $4.65 |
| Sante fully independent? | Yes | **Yes** | No |
| Multi-item cart | No | **Yes** | No |
| Price change from phone | N/A | **One step** | Three steps, needs computer |
| Inventory tracking | No | **Yes** | No |
| Abandoned cart recovery | No | **Yes** | No |
| Apple/Google/Shop Pay | No | **Yes** | Yes |
| Order management | Manual | **Full dashboard** | Payments list only |
| Scalable | No (~20 orders/wk) | Yes | Barely |

### Recommendation

**Phase 1 (Today):** Start DM sales via Venmo/CashApp. Zero setup. Prove demand. Build Instagram audience.

**Phase 2 (Week 2-3):** Set up Shopify Starter ($5/mo) under Yahir. Embed Buy Buttons on site. Sante takes over product management from his phone. The extra ~$2.85/sale buys: Sante's independence, real cart, abandoned cart emails, inventory, order management. Worth it.

**Phase 3 (When ITIN arrives, ~3-4 months):** Transfer Shopify account to Sante's name. Or if volume hits 11+ orders/month, upgrade to Shopify Basic ($39/mo) for 2.9% rate.

### ITIN Path (Long-Term)

The ITIN (Individual Taxpayer Identification Number) is the key that unlocks Sante's financial independence:
- Available regardless of immigration status (IRS Section 6103 protects taxpayer info)
- Apply via Form W-7 through a Certified Acceptance Agent (CAA)
- Documents: passport or matrícula consular
- Cost: free from IRS (CAA may charge $50-200)
- Processing: 7-14 weeks
- Once received: own bank account, own Stripe/Shopify, own LLC if desired
- Organizations: Immigrants Rising (immigrantsrising.org), NILC (nilc.org), local CAAs via irs.gov

### Status
- **DECIDED:** Snipcart is out (cost + Sante's situation)
- **DECIDED:** Payment account will be under Yahir initially, transferred when Sante gets ITIN
- **OPEN:** Which of the 3 options to use -- Sante needs to decide (recommendation: Shopify Starter)

---

## 5. Admin Panel Plan

### If Shopify Starter Is Chosen (Recommended)

**No custom admin panel needed.** Shopify IS the admin:
- Sante manages products, prices, images, inventory, orders, and discounts from the **Shopify mobile app**
- Changes sync to the Buy Buttons on the site automatically
- No Firebase, no Sanity, no Google Sheets, no custom code
- This eliminates 10-15 hours of dev work

The previous Firebase and Sanity.io plans are **on hold** unless we go with Stripe Payment Links (Option C), which requires a separate product management layer.

### If Stripe Payment Links Is Chosen (Option C)

A product data layer is needed since Stripe has no product management UI suitable for a non-technical person. Two options:

**Google Sheets (fastest):** Sante edits a spreadsheet -> site fetches on load -> renders products. ~4-8 hours to build. Free. 5-10 minute update delay.

**Sanity.io (best long-term):** Beautiful drag-and-drop editor at santedesigns.sanity.studio. ~8-16 hours to build. Free tier (500K API calls/mo). Updates in seconds.

### If Venmo/CashApp Only (Option A)

No admin panel needed. Products are just HTML on the site. Price changes require editing HTML (Yahir does it) or building one of the above solutions later.

### Previous Firebase Plan
Full technical spec still at `tasks/admin-spec.md` if we ever need a fully custom admin. ~10-15 hours to build. Blocked on: Sante's Google email, payment decision, real product content.

### Status
- **UPDATED:** If Shopify Starter, no custom admin needed (Shopify app replaces it)
- **ON HOLD:** Firebase and Sanity.io plans -- only needed if Stripe is chosen
- **ON HOLD:** admin-spec.md implementation

---

## 6. What's Left (Dev Work, After Sante Provides Content)

### Launch Blockers
- [ ] Replace all `[BRACKETED PLACEHOLDERS]` with real content
- [ ] **Payment integration:** Remove Snipcart script tags from all pages. Integrate chosen payment option (Shopify Buy Button SDK or Stripe Payment Links or Venmo/CashApp links)
- [ ] If Shopify: Set up Shopify Starter account under Yahir, install Buy Button sales channel, embed SDK
- [ ] If Shopify: Style Buy Button + cart overlay to match brand (black/#4cff16, Inconsolata font)
- [ ] Enable GitHub Pages, buy domain, configure CNAME + SSL
- [ ] Mobile testing at 375px, 390px, 428px (most traffic is mobile from Instagram)
- [ ] Open Graph / Twitter meta tags with real content
- [ ] End-to-end checkout test (place a real test order through chosen payment method)

### Nice-to-Have (Post-Launch)
- [ ] Add skip-to-content `<a>` tags to all HTML pages (CSS is ready)
- [ ] Replace remaining inline styles with CSS classes
- [ ] Product image gallery support (currently single image)
- [ ] Skeleton loading states for product images
- [ ] Hamburger adaptive color for dark-background pages
- [ ] `aria-current="page"` on active nav links
- [ ] `<meta name="theme-color">` on all pages
- [ ] If Shopify: Add Venmo/CashApp as secondary payment options on site
- [ ] Sante ITIN application (unlocks transferring accounts to his name)
- [ ] If volume > 11 orders/mo at $150 avg: upgrade Shopify Starter -> Basic ($39/mo, 2.9% rate)

---

## 7. Technical Reference

Full project conventions live in `CLAUDE.md` at root. Key highlights:

- **Stack:** Vanilla HTML/CSS/JS, GSAP 3.13 + ScrollTrigger via CDN, Google Fonts, GitHub Pages. E-commerce: Shopify Buy Button SDK (recommended) or Stripe Payment Links or Venmo/CashApp
- **CSS:** Single `css/style.css` -- BEM-like with `c-` prefix, design tokens in `:root`, 8px base grid (`--s-1` through `--s-48`), fluid type via `clamp()`
- **Breakpoints:** 768px (sidebar collapses), 480px (single column), 1024px (grid shifts)
- **JS entry:** `js/main.js` imports all modules -- animations in `js/animations/`, components in `js/components/`
- **Design philosophy:** Gallery walk not comparison shopping; anti-commercial (no pop-ups, no urgency); blackletter + monospace tension; curator language ("archive" not "shop"); neon disruption (lime green accent, used sparingly); generous whitespace
- **Do NOT add:** frameworks, analytics, email capture, social proof, contact forms -- see `CLAUDE.md` for full list

### File Structure (Abbreviated)

```
index.html, archive.html, product.html, lookbook.html,
story.html, donate.html, oneofone.html, sound.html, drop.html
legal/  (terms, privacy, shipping)
css/    style.css
js/     main.js, gsap-init.js
        animations/  (marquee, fade-reveal, hover-scale)
        components/  (nav, cart, drop-gate, countdown)
assets/ img/ (icons, logo, orgs, placeholders)
tasks/  MASTER.md (this file), admin-spec.md
```
