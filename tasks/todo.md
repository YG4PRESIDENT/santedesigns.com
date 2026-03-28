# santedesigns.com — Project Status

## Completed

### Phase 1: Foundation + Layout Shell
- [x] Directory structure created
- [x] `css/style.css` — design tokens, reset, base, layout (20/80 sidebar grid), all components
- [x] `index.html` — full homepage: hero, marquee, featured grid, editorial block, footer
- [x] `js/gsap-init.js` — GSAP + ScrollTrigger registration, reduced-motion helpers
- [x] `js/components/nav.js` — sidebar active state, mobile hamburger, focus trapping
- [x] `js/animations/marquee.js` — infinite horizontal loop with scroll-velocity modulation
- [x] `js/animations/fade-reveal.js` — scroll-triggered fade-up with stagger groups
- [x] `js/animations/hover-scale.js` — product card hover + keyboard focus scale
- [x] `.gitignore`, `robots.txt`, `netlify.toml`

### Phase 2: Page Templates
- [x] `archive.html` — asymmetric 3-column product grid
- [x] `product.html` — split-screen (sticky image / scrolling details)
- [x] `lookbook.html` — full-bleed editorial gallery
- [x] `story.html` — brand manifesto page
- [x] `sound.html` — embed placeholders (Spotify, SoundCloud, Apple Music)
- [x] `drop.html` — password-gated page with countdown timer

### Phase 3: E-Commerce + Legal
- [x] Snipcart script tags on all pages (including lookbook, story — fixed in audit)
- [x] `js/components/cart.js` — Snipcart event hooks, cart count badge
- [x] `js/components/drop-gate.js` — SHA-256 client-side password check
- [x] `js/components/countdown.js` — modular countdown timer (extracted from inline)
- [x] `legal/terms.html`, `legal/privacy.html`, `legal/shipping.html`
- [x] `sitemap.xml`

### Audit Fixes Applied
- [x] Fixed `product.html` wrong `data-page` attribute
- [x] Fixed marquee.js `gsap.utils.unitize()` misuse
- [x] Fixed fade-reveal.js stagger duplicate animation bug (Set tracking)
- [x] Fixed gsap-init.js — removed `globalTimeline.timeScale(0)` that killed all animations
- [x] Fixed drop-gate.js — event listener memory leak on unlock
- [x] Added `isGSAPReady()` and `prefersReducedMotion()` helpers
- [x] Added Snipcart to lookbook.html and story.html
- [x] Added focus-visible styles for all interactive elements (WCAG)
- [x] Added skip-to-content CSS class
- [x] Added `.c-legal-page` CSS classes (replacing inline styles)
- [x] Added `.site-header-mobile__logo` and `__actions` CSS classes
- [x] Added keyboard focus trigger on hover-scale (accessibility)
- [x] main.js now has try/catch per module (graceful degradation)
- [x] Countdown timer extracted to proper ES module

## Remaining (After Survey)

### Phase 4: Content Pour
- [ ] Replace all `[BRACKETED PLACEHOLDERS]` with Sante's survey content
- [ ] Swap placeholder images with real assets from The Vault Link
- [ ] Apply Sante's typography preferences (may change font pairing)
- [ ] Apply color preferences from survey
- [ ] Set Sante's Instagram handle on all pages
- [ ] Add Open Graph / Twitter meta tags with real content
- [ ] Add meta descriptions with real content

### Phase 5: E-Commerce Setup
- [ ] Create Snipcart account and get API key
- [ ] Replace `[YOUR_SNIPCART_PUBLIC_API_KEY]` on all pages
- [ ] Add real products with proper `data-item-*` attributes
- [ ] Test checkout flow end-to-end
- [ ] Connect Stripe to Snipcart dashboard

### Phase 6: Hosting & Deploy (GitHub Pages)
- [ ] Init git repo in project folder
- [ ] Push to Yahir's GitHub account
- [ ] Enable GitHub Pages (Settings → Pages → Deploy from branch)
- [ ] Buy santedesigns.com domain (~$10-12/yr)
- [ ] Add custom domain in GitHub Pages settings (CNAME)
- [ ] SSL auto-provisions
- [ ] Test production build

### Phase 7: Mobile Polish (Priority — Most Traffic is Mobile)
- [ ] Test all pages at 375px, 390px, 428px viewports
- [ ] Verify hamburger menu feel (touch targets, animation smoothness)
- [ ] Check scroll performance on mobile (marquee, fade reveals)
- [ ] Ensure thumb-reachable cart button placement
- [ ] Test Snipcart checkout flow on mobile
- [ ] Verify font rendering at mobile sizes (blackletter legibility)
- [ ] Check hero section aspect ratio on mobile
- [ ] Test drop page password input on mobile keyboards

### Known Issues (Medium Priority)
- [ ] Add skip-to-content `<a>` tag to all HTML pages (CSS is ready)
- [ ] Replace remaining inline styles in HTML with CSS classes
- [ ] Add product image gallery support (currently single image only)
- [ ] Add skeleton loading state CSS for product images
- [ ] Add Snipcart timeout/fallback if CDN fails
- [ ] Add hamburger adaptive color for dark-background pages (drop.html mobile)
- [ ] Add `aria-current="page"` to active nav links in HTML
- [ ] Add `<meta name="theme-color">` to all pages (currently only index.html)
- [ ] Legal pages should include Snipcart for cart continuity

## File Inventory (24 files)

```
santedesigns.com/
├── CLAUDE.md                    ← Project guide
├── tasks/todo.md                ← This file
├── index.html                   ← Homepage
├── archive.html                 ← Collection grid
├── product.html                 ← Product detail
├── drop.html                    ← Password-gated drop
├── lookbook.html                ← Editorial gallery
├── story.html                   ← Brand manifesto
├── sound.html                   ← Music/playlists
├── legal/
│   ├── terms.html
│   ├── privacy.html
│   └── shipping.html
├── css/
│   └── style.css                ← Single stylesheet (~1100 lines)
├── js/
│   ├── main.js                  ← Entry point
│   ├── gsap-init.js             ← GSAP setup
│   ├── animations/
│   │   ├── marquee.js
│   │   ├── fade-reveal.js
│   │   └── hover-scale.js
│   └── components/
│       ├── nav.js
│       ├── cart.js
│       ├── drop-gate.js
│       └── countdown.js
├── assets/                      ← Empty, waiting for content
├── .gitignore
├── robots.txt
├── sitemap.xml
└── netlify.toml
```
