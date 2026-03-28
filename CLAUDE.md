# santedesigns.com — Project Guide

## What This Is
A full brand website for fashion/graphics designer **Sante**, replacing an expensive Shopify store. Built as a custom static site with Snipcart e-commerce. Total monthly cost: $0 — only transaction fees when something sells.

## Design Philosophy (Critical — Read This First)
This site's vibe target is **anewrenaissance.studio**. The design works because of its *philosophy*, not its CSS. Respect these principles:

1. **Gallery walk, not comparison shopping.** The 20/80 sidebar forces vertical, one-path exploration. Don't add horizontal nav, filtering bars, or comparison UIs.
2. **Anti-commercial confidence.** No pop-ups, no FOMO timers, no urgency badges, no "only X left" messages. The site self-selects its audience through restraint.
3. **Typography as tension.** Blackletter (UnifrakturCook/Pirata One) + monospace (Inconsolata) coexist in unresolved tension — medieval vs. digital. Neither dominates. Don't normalize this by switching to a safe sans-serif.
4. **Nomenclature matters.** Use curator language — "archive" not "shop", "creation" not "products". The vocabulary IS the brand.
5. **Neon disruption.** Black/white palette with one aggressive accent (lime green `#4cff16`). Use the accent sparingly — it's the "wake up" moment in a whispering room.
6. **Generous void.** Whitespace is confrontational, not accidental. Don't fill empty space. Each element gets its own moment.

## Tech Stack
- **Vanilla HTML/CSS/JS** — no framework, no build step, no bundler
- **GSAP 3.13 + ScrollTrigger** via CDN — marquee, scroll reveals, hover effects
- **ES Modules** — native browser, loaded with `<script type="module">`
- **Snipcart** — $0/mo e-commerce, `data-item-*` attributes on buttons
- **Google Fonts** — UnifrakturCook (display), Pirata One (nav), Inconsolata (body), Inter (legal/utility)
- **Hosting** — GitHub Pages (free, Yahir's existing GitHub account)
- **Domain** — santedesigns.com (TBD where to buy, ~$10-12/yr)
- **Mobile-first** — most traffic comes from Instagram (mobile). Design/test for 375px-428px first, desktop second

## File Structure
```
css/style.css          — Single stylesheet (tokens → reset → base → layout → components → utilities)
js/main.js             — Entry point, imports all modules with try/catch
js/gsap-init.js        — GSAP registration, reduced-motion helpers
js/animations/         — marquee.js, fade-reveal.js, hover-scale.js
js/components/         — nav.js, cart.js, drop-gate.js, countdown.js
```

## Key Conventions
- **CSS**: BEM-like naming with `c-` prefix (e.g., `.c-nav__link`, `.c-product-card__image`)
- **Design tokens**: All colors, fonts, spacing, timing in `:root` block of style.css — never hardcode values
- **Spacing**: 8px base grid via `--s-1` through `--s-48`
- **Typography**: Fluid sizing via `clamp()` — no media query breakpoints for font sizes
- **Breakpoints**: 768px (sidebar collapses to mobile), 480px (single column), 1024px (product grid shifts)
- **Placeholders**: Bracketed labels like `[HOOK PARAGRAPH FROM SURVEY]` — all survey-dependent content
- **Accessibility**: `focus-visible` on all interactive elements, `prefers-reduced-motion` disables GSAP, skip-to-content link, aria attributes on overlays

## Pages
| Page | File | Purpose |
|------|------|---------|
| Homepage | `index.html` | Hero, marquee, featured products, editorial block |
| Archive | `archive.html` | Asymmetric product grid, Snipcart add-to-cart |
| Product | `product.html` | Split-screen: sticky image / scrolling details |
| Lookbook | `lookbook.html` | Full-bleed editorial gallery |
| Our Story | `story.html` | Brand manifesto |
| Sound | `sound.html` | Spotify/SoundCloud embeds |
| Drop | `drop.html` | Password-gated page with countdown timer |
| Legal (x3) | `legal/*.html` | TOS, Privacy, Shipping — required for Snipcart |

## Content Source
Sante is filling out a survey ("Sante's Digital Archive: The Renaissance Brainstorm") with these questions:
1. The Hook Paragraph → `index.html` hero subtitle
2. The Centerpiece Link → `index.html` hero media
3. The Texture → informs overall CSS/design decisions
4. The Artifacts → determines product presentation approach
5. The Lore Manifesto → `story.html` content, `index.html` editorial block
6. The Typography Mark → font choices (may change from current placeholders)
7. The Cold Community → whether to add Discord/community features
8. The Vault Link → raw assets to populate product images, lookbook
9. Easter Eggs → hidden details throughout the site

## What Not To Do
- Don't add a templating engine unless maintaining 10+ pages becomes unmanageable
- Don't add analytics or tracking without explicit ask — this is anti-surveillance
- Don't add email capture pop-ups — violates anti-commercial philosophy
- Don't use React, Vue, or any framework — vanilla is the point
- Don't add "social proof" badges, review counts, or urgency indicators
- Contact is via Instagram only — no contact forms
