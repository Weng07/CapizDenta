# CAPIZDENTA — Developer Notes

---

## 📋 Changelog

### v1.0.0 — Initial Release
- Homepage with Hero, About, Services, Hours & Booking, Testimonials, FAQ, Contact, Footer
- Fully responsive (mobile, tablet, desktop)
- Appointment request form with validation and toast confirmation
- FAQ accordion
- Scroll-reveal animations
- Navbar scroll shadow effect + mobile hamburger menu
- Today's clinic hours auto-highlighted
- Back-to-top button
- Standalone `pages/about.html`

---

## 🗺️ Roadmap / Future Upgrades

### 🔴 High Priority
- [ ] Replace emoji icons with proper SVG icons (Heroicons or Lucide)
- [ ] Add real clinic photos to `assets/images/` and replace placeholders
- [ ] Connect booking form to a real backend (EmailJS, Formspree, or custom API)
- [ ] Add favicon and Open Graph meta tags for social sharing previews

### 🟡 Medium Priority
- [ ] Add a dedicated `pages/services.html` with detailed pricing per service
- [ ] Add a `pages/contact.html` with embedded Google Maps iframe
- [ ] Implement a simple blog/announcements section
- [ ] Add cookie/privacy notice banner (GDPR-friendly)
- [ ] Add WhatsApp floating button (common in PH websites)

### 🟢 Nice to Have
- [ ] Dark mode toggle
- [ ] Animate service card icons on hover
- [ ] Patient photo gallery section
- [ ] Before/after smile transformation slider
- [ ] Multi-language support (English / Filipino)
- [ ] Add `sitemap.xml` and `robots.txt` for SEO

---

## 🖼️ Assets Guide

### `assets/images/`
Recommended files to add:
| Filename | Usage |
|---|---|
| `hero-banner.jpg` | Hero section background or right-side image |
| `clinic-exterior.jpg` | About section image |
| `clinic-interior.jpg` | About section or gallery |
| `team-photo.jpg` | About or team section |
| `og-image.jpg` | Open Graph preview (1200×630px) |

Recommended format: **WebP** for best performance. Keep under 200KB each.

### `assets/icons/`
| Filename | Usage |
|---|---|
| `favicon.ico` | Browser tab icon |
| `favicon-32x32.png` | Standard favicon |
| `apple-touch-icon.png` | iOS home screen icon (180×180px) |
| `icon-tooth.svg` | Reusable tooth SVG icon |

### `assets/fonts/`
Only needed if self-hosting fonts (instead of Google Fonts CDN).
Add `.woff2` files here and update `css/styles.css` with `@font-face` rules.

---

## 🔗 Adding a New Page

1. Create `pages/your-page.html`
2. Copy the nav and footer from `pages/about.html`
3. Update all relative paths (`../css/styles.css`, `../js/main.js`, `../index.html`)
4. Add a link to it in the nav and footer of all other pages

---

## 📦 Adding npm / Build Tools (Future)

If the project grows to need a bundler (Vite, Webpack):
```bash
npm init -y
npm install --save-dev vite
```
Then move source files into `/src/` and output to `/dist/`.
Update `.gitignore` to exclude `node_modules/` and `/dist/`.

---

## 🧪 Browser Support

Tested on:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+
- Mobile Chrome (Android)
- Mobile Safari (iOS)

---

## 📝 Notes

- The booking form currently does **not** send emails. It only validates and shows a toast.
  To make it functional, integrate with **EmailJS** (free tier available) or **Formspree**.
- The Google Maps section links to the clinic's Google Maps pin. To embed a live map,
  replace the `.map-placeholder` div in `index.html` with a Google Maps `<iframe>`.
- Tuesday is hardcoded as "Closed" in both `index.html` and `js/main.js`. Update both if hours change.
