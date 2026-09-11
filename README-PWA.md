# Wishboard — PWA build

This folder turns `wishboard.html` into an installable Progressive Web App.
No behavior changed — same wishlist/purchased app, same on-device
localStorage data. What's added:

```
index.html        (your original file, + PWA tags + service worker registration)
manifest.json      (app name, colors, icon list)
sw.js              (offline caching)
icons/             (all icon sizes generated from your icon design)
```

## Where the icon came from

The icon is the purple wand-and-dollar-bill artwork already included in
your `wishboard-mobile.zip` (`assets/icon.png`, 1024×1024). It's been resized
into every size Android, iOS, and macOS need, plus two "maskable" versions
(`icons/maskable-192.png`, `icons/maskable-512.png`) with extra padding so
the design isn't cropped when Android applies a circular/squircle mask.

If you'd rather use a different image, replace `extracted/assets/icon.png`
equivalent — i.e. drop a new 1024×1024 PNG in as the source and regenerate
the sizes listed in `manifest.json` and `index.html`'s `<head>`.

## What each platform uses

- **Android / Chrome**: `manifest.json`'s `icons` array — both `any` and
  `maskable` entries are included.
- **iOS "Add to Home Screen"**: the `apple-touch-icon` `<link>` tags in
  `index.html` (180×180 is the primary one; 152/167 cover older iPad sizes).
  `apple-mobile-web-app-capable` makes it open without Safari's UI chrome.
- **macOS Safari 17+ "Add to Dock"**: reads the same web manifest as
  Android/Chrome (prefers the 512×512 `any`-purpose icon), and falls back to
  the `apple-touch-icon` if no manifest icon is suitable. Both are covered
  here, so no separate work was needed for it.

## Testing locally

Service workers require either `https://` or `localhost` — they will not
register over plain `http://` or a `file://` double-click. From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser. Open DevTools →
Application → Service Workers to confirm it registered, and → Manifest to
check the icons loaded correctly.

To test the "installable" prompt and offline behavior: load the page once
online, then in DevTools → Network set "Offline" and reload — the app
should still open.

## Deploying

Upload this whole folder (keeping the folder structure — `icons/` must sit
next to `index.html`) to any static host (Netlify, Vercel, GitHub Pages,
Cloudflare Pages, your own server). It needs HTTPS, which all of those
provide by default. Once live:

- **Android/desktop Chrome**: an install icon appears in the address bar,
  or Menu → "Install Wishboard".
- **iOS Safari**: Share sheet → "Add to Home Screen".
- **macOS Safari 17+**: File menu → "Add to Dock".

## Updating later

If you change `index.html` or the icons after deploying, bump
`CACHE_VERSION` at the top of `sw.js` (e.g. `"v1"` → `"v2"`). That forces
installed copies to fetch the new files instead of serving the old cached
ones.
