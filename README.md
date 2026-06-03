# Quvo Café — Static Website

A static website for **Quvo Café**, Bacoor's newest homegrown café located at Molino 4, Molino-Paliparan Road, Bacoor, Cavite. Built with vanilla HTML, CSS, and JavaScript — no build tools or frameworks required.

---

## Quick Start

### Option A — Open directly
```
open index.html
```
Most browsers handle static files fine. Note: the hero video, fonts (Google Fonts), and logo image require an internet connection.

### Option B — Local HTTP server (recommended)
```bash
# Python 3
python3 -m http.server 8080
# then visit http://localhost:8080

# Node.js
npx serve .
```

---

## File Structure

```
boCoffee/
├── index.html          ← Homepage (hero video, categories, carousel, footer)
├── aboutus.html        ← About Us (story, values, community section)
├── drinkmenu.html      ← Drink Menu (full menu image display)
├── foodmenu.html       ← Food Menu (full menu image display)
├── careers.html        ← Careers (open roles, apply form)
├── policy.html         ← Privacy Policy
│
├── css/
│   └── style.css       ← Master stylesheet (all design tokens, layout, components, page styles)
│
├── js/
│   └── main.js         ← All interactivity (mobile drawer, carousel, scroll animations, forms)
│
└── images/             ← Local assets (logo, hero video, menu images, category photos)
```

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Homepage | `index.html` | Hero video, shop-by-category grid, menu CTA strip, featured products carousel, footer |
| About Us | `aboutus.html` | Café story, values image cards, community section |
| Drink Menu | `drinkmenu.html` | Full drink menu displayed as an image |
| Food Menu | `foodmenu.html` | Full food menu displayed as an image |
| Careers | `careers.html` | Why join, open roles listing, application form |
| Privacy Policy | `policy.html` | Privacy policy content |

---

## Interactive Features

| Feature | Notes |
|---------|-------|
| Sticky header | Shrinks and gains shadow on scroll |
| Mobile hamburger menu | Slide-out drawer, closes on overlay click or ESC |
| Auto-scrolling carousel | Infinite loop, draggable on mouse and touch |
| Scroll-triggered animations | Fade-up on section entry via IntersectionObserver |
| Smooth anchor scroll | All `#hash` links scroll smoothly |
| Image error fallback | Broken images replaced with a warm gradient + ☕ icon |
| Active nav highlight | Current page link is highlighted automatically |
| Hero video fallback | Falls back to a gradient if the video fails to load |
| Careers apply form | Client-side success feedback, no backend required |

---

## Design Tokens

All design decisions are defined as CSS custom properties in `css/style.css`:

```css
--color-primary:   #501818   /* Deep mahogany — brand red */
--color-accent:    #c08740   /* Warm gold — highlights */
--color-cream:     #f9f4ee   /* Off-white backgrounds */
--font-display:    'Playfair Display'    /* Headlines */
--font-body:       'Lato'               /* Body text */
--font-serif:      'Cormorant Garamond' /* Italic accents */
```

---

## Browser Support

Tested on modern browsers (Chrome 120+, Firefox 121+, Safari 17+, Edge 120+). Uses `IntersectionObserver`, CSS Grid, `position: sticky`, and CSS custom properties — all baseline-supported since 2020.

---

## Social

- Facebook: [facebook.com/QuvoCafe](https://www.facebook.com/QuvoCafe)
- TikTok: [tiktok.com/@quvo.cafe](https://www.tiktok.com/@quvo.cafe)

---

*All content and branding belong to Quvo Café. Website built for reference and local use.*