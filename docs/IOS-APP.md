# Good Plans iOS app

Good Plans ships first as an **installable iOS web app** (Add to Home Screen) that reuses the live Worker API and local-first drafts. A native Xcode/Capacitor wrap can come later without changing the product model.

## What is live in the repo

- `public/manifest.webmanifest` — standalone display, cream theme, start URL `/?app=1`
- Apple meta tags in `index.html` (`apple-mobile-web-app-capable`, status bar, touch icon)
- Phone / app Home (`src/components/IosHome.jsx`) — upcoming plans, people, explore, new plan
- Bottom tab bar (`GoodPlansMobileNav`) under 760px with safe-area padding
- Detection helpers in `src/lib/iosApp.js` (standalone, Apple device, `?app=1`)

On phone widths, or when opened as a home-screen app, **Home** opens the app dashboard instead of the marketing landing page. Desktop keeps the scrapbook homepage.

## Install on iPhone / iPad

1. Open https://goodplans.luana.systems in Safari (or a preview URL).
2. Tap **Share** → **Add to Home Screen**.
3. Open the icon — it runs fullscreen with the app Home and tab bar.

Locally: `npm run dev`, then visit `http://127.0.0.1:3000/?app=1` at a phone width.

## Native wrap (later)

When you want TestFlight / App Store:

1. On a Mac with Xcode, add Capacitor (or a thin WKWebView shell) pointed at the production origin or bundled `dist`.
2. Keep auth cookies / OTP and D1 API on the Worker — do not fork business logic into Swift.
3. Use associated domains for invitation deep links (`/events/:slug`).

This repo does not yet include an `ios/` Xcode project; the web app is the source of truth.
