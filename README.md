# CAPIZDENTA — Official Website

> "Don't let the world change your smile — use your smile to change the world."

A professional business website for **CAPIZDENTA Dental Clinic**, located in Roxas City, Capiz, Philippines.

---

## 📁 Project Structure

```
my-website/
├── index.html          # Main homepage (all sections)
├── README.md           # This file
├── .gitignore          # Files excluded from version control
│
├── css/
│   └── styles.css      # All styles (variables, layout, components, responsive)
│
├── js/
│   └── main.js         # All interactivity (nav, FAQ, form, animations)
│
├── assets/
│   ├── images/         # Photos: clinic, team, banners (JPG/PNG/WebP)
│   ├── icons/          # Favicon, app icons, SVG icons
│   └── fonts/          # Self-hosted fonts (if switching from Google Fonts)
│
├── pages/
│   └── about.html      # Standalone About page (future expansion)
│
└── docs/
    └── notes.md        # Developer notes, changelog, and TODOs
```

---

## 🚀 Getting Started

No build tools needed. Just open `index.html` in a browser.

For local development with live reload:
```bash
# Option 1: VS Code — install "Live Server" extension, right-click index.html > Open with Live Server
# Option 2: Node.js
npx serve .
# Option 3: Python
python -m http.server 8000
```

---

## 🎨 Design Tokens (CSS Variables)

All colors and fonts are defined in `css/styles.css` under `:root`. To rebrand, only edit this block:

```css
:root {
  --navy:   #0d2b45;   /* Primary dark — headings, footer bg */
  --ocean:  #1a5f7a;   /* Secondary — buttons, links */
  --sky:    #3a9ec2;   /* Accent — hover states, icons */
  --coral:  #e8734a;   /* CTA — buttons, highlights */
  --gold:   #c8a96e;   /* Accent — stars, footer links */
  --cream:  #faf7f2;   /* Background — main page bg */
  --white:  #ffffff;
  --gray:   #6b7280;   /* Body text, subtitles */
  --border: #dde3ea;   /* Card borders, dividers */
}
```

Fonts are loaded from Google Fonts:
- **Cormorant Garamond** — headings (h1, h2, logo)
- **DM Sans** — body text, UI elements

---

## 📄 Pages

| File | Description |
|---|---|
| `index.html` | Full homepage: Hero, About, Services, Hours, Booking, Reviews, FAQ, Contact, Footer |
| `pages/about.html` | Standalone About page (ready for expansion) |

---

## 🔧 Key JavaScript Functions (`js/main.js`)

| Function | What it does |
|---|---|
| `scrollToSection(selector)` | Smooth scrolls to any section |
| `closeMobile()` | Closes the hamburger menu |
| `toggleFaq(btn)` | Opens/closes FAQ accordion items |
| `submitBooking()` | Validates and submits the appointment form |
| `showToast()` | Shows the confirmation toast notification |
| `clearForm()` | Resets all booking form fields |
| `revealObserver` | IntersectionObserver for scroll-reveal animations |

---

## 📞 Clinic Contact Info

| | |
|---|---|
| 📍 Location | Roxas City, Capiz, Philippines 5800 |
| 📞 Phone | 0954 405 5391 / 0906 435 3619 / 0933 850 9267 |
| ✉️ Email | dental.talks@yahoo.com |
| 📘 Facebook | [CAPIZDENTA](https://www.facebook.com/profile.php?id=100083309584253) |
| 🗺️ Google Maps | [Open Map](https://maps.app.goo.gl/qbGk37Xyy9yruc2S6) |

---

## 🌐 Deployment

This is a static site. It can be hosted on:
- **GitHub Pages** — free, push to `main` branch
- **Netlify** — drag and drop the folder
- **Vercel** — connect GitHub repo
- **cPanel / Shared Hosting** — upload via FTP

---

## 📌 Future Upgrades

See `docs/notes.md` for the full roadmap and changelog.
