# Wishboard first update — GitHub Pages release

This package preserves the existing single-page Wishboard app and its three themes. It adds a no-account public demo mode alongside the existing private account experience, plus a private activity foundation, purchase-reflection checkpoint, Insights view, per-pin view counts, password-reset access, rounded floating navigation, retailer discovery shortcuts, and a retailer-grouped Wishboard cart.

## What changed
- **Passkey-ready authentication:** the app opts into Supabase Auth WebAuthn passkeys and includes passkey sign-in plus an authenticated-account “Add passkey” action. This uses the browser/device authenticator (Touch ID, Face ID, Windows Hello, device PIN, or a security key where supported); Wishboard never receives biometric data. Supabase project-side passkey configuration is still required before this feature can work. See “Enable passkeys” below.
- **Public demo mode:** the login screen now offers Explore the demo without requiring an account. It opens a sample Wishboard with example pins and activity so visitors can try the core experience immediately. Demo edits are isolated in browser-local storage and never write to Supabase or modify a signed-in user's data. The demo banner includes Reset demo and Exit demo controls.
- **Cleaner pin editing:** removed the duplicate photo preview from the edit form; the existing pin photo remains visible above, with one compact **Replace** button to choose a new image.

- **Last Chance to Transcend:** clicking a saved product link opens a short, optional reflection checkpoint. The user can stay on Wishboard or continue to the retailer. It does not prevent purchasing.
- **Insights:** shows current wishlist value, confirmed purchase events, today's / last 7 days' / this month's purchase totals, pin opens, retailer-page visits, and the most-opened pin.
- **Pin views:** intentional opens are counted; the count appears in the pin detail.
- **Purchase activity:** marking a pin Purchased records a dated amount/title snapshot. Existing item and tab records are not rewritten by the migration.
- **Forgot password:** uses Supabase's password-reset email flow.
- **Unified floating tabs:** Wishlist, Purchased, Transcended, custom tabs, Insights, Discover, and Cart use a consistent rounded, elevated treatment across all three themes.
- **Discover:** search shortcuts open live search pages at Google Shopping, Amazon, Target, Walmart, Etsy, eBay, and Best Buy. Save a found product with Add pin and its product-page URL.
- **Wishboard cart:** add a saved pin from its detail view; the cart groups saved items by retailer, shows a live total, and provides product-page handoffs. Demo carts remain local to the browser. Signed-in users sync their cart item IDs through Supabase account metadata, with local storage as an immediate/offline fallback; no extra table or paid service is required.
- **PWA support:** the web manifest is linked and the service worker is registered automatically on HTTPS. The app shell can reopen offline after a successful first load; account authentication and remote sync still require connectivity.


## Enable passkeys (one-time Supabase setup)

Passkeys are an experimental Supabase Auth feature and require the project setting to be enabled. The app code is prepared, but passkeys will return `passkey_disabled` until you complete this step.

1. Open the Supabase project for Wishboard.
2. Go to **Authentication → Passkeys** and enable passkey authentication.
3. Set the relying-party display name to `Wishboard`.
4. Set the relying-party ID to `dcc1122dcc.github.io`.
5. Add the allowed WebAuthn origin `https://dcc1122dcc.github.io`. The origin is the domain only—do not include `/wishboard/`.
6. Save the settings. Keep email/password enabled as the recovery path.
7. Publish this app release, sign in to a real Wishboard account, and choose **Add passkey**. Then log out and test **Sign in with a passkey**.

Passkey API support is experimental and requires a current browser with WebAuthn support over HTTPS. The device may ask for Touch ID, Face ID, Windows Hello, a device PIN, or another authenticator. Which prompt appears is decided by the operating system/browser, not by Wishboard. Existing users should retain email/password access. Do not register a passkey against the public demo; demo mode intentionally has no real account.

If you later move Wishboard to a custom domain, update the WebAuthn relying-party ID and allowed origin in Supabase to match that domain before users register passkeys there.

## Demo mode and Supabase
The public demo can be explored without running the activity migration. Real account activity and Insights still require the Supabase migration described below. Signed-in cart sync does not require a database migration; it uses the authenticated user metadata field `wb_cart_ids`.

## Important: run the Supabase migration first

1. Open your Supabase project and go to **SQL Editor**.
2. Open `supabase-item-activity-migration.sql` from this package.
3. Review it, then run it once.
4. The migration creates only `public.item_activity`, indexes, and user-scoped RLS policies. It does not modify or delete `items`, `tabs`, or existing user data.
5. Confirm the new table has RLS enabled and the two policies (`select own item activity`, `insert own item activity`) exist.

The app's Insights view will show a setup note until the migration has been run. Existing Wishboard pins continue to work without the activity table, but analytics and reflection-event history need it. Cart sync is separate and does not require this migration.

## Publish to the existing GitHub Pages repository

GitHub Pages does not unpack a ZIP that is uploaded as a file. Extract this ZIP on your computer, then:

1. Open the existing repository that publishes `https://dcc1122dcc.github.io/wishboard/`.
2. Upload the **contents** of the extracted package folder into the repository's published root (the same level where the current `index.html` lives). Do not upload the ZIP itself and do not create an extra nested `wishboard-main` folder.
3. Keep the existing repository settings and GitHub Pages source/branch unchanged.
4. Commit the files. GitHub Pages will publish the new version after the commit is processed.
5. Visit the site and hard-refresh once. If an installed PWA still shows the previous version, close/reopen it after the service worker refreshes.

If your repository contains additional files not included in this package, do not delete them. Replace the matching app files and add the new SQL/README files.

## Test checklist after publishing

- Open the public demo in a fresh/private browser window and confirm it loads without signing in.
- Add a demo pin, move it to a custom tab, add it to Cart, and confirm the cart total updates.
- Reload the demo and confirm local demo changes persist; use Reset demo to restore the sample state.
- On a signed-in account, add/remove a cart item and verify the cart is retained after signing out and back in on another browser/device.
- Confirm the browser extension opens Wishboard with a prefilled draft and that the user can review it before saving.
- Confirm the site can be installed as a PWA on a supported browser and reopens offline after its first successful load.


- Sign in and confirm existing pins and custom tabs are present.
- Open a pin and confirm its view count appears in the detail.
- Click a retailer link and confirm the reflection checkpoint appears; test both choices.
- Mark a test pin Purchased and confirm Insights updates.
- Switch between Original, Consumerist, and Dalí themes.
- Test Forgot password using an email address on your account. Ensure the reset redirect URL is allowed in Supabase Auth URL Configuration.

## Notes and limitations
- Demo data is sample data stored only in the visitor's browser. It is not a shared public sample account and does not sync between devices. Reset demo restores the sample content. Real personal data remains behind Supabase authentication.

- Historical views and purchases cannot be reconstructed. Activity starts after this update and migration are installed.
- “Purchase confirmed” means the user marked the pin Purchased in Wishboard. Wishboard does not verify an actual retailer transaction or connect to a bank.
- Discover opens retailer search pages; it does not yet provide a live in-app product catalog or automatic product import. The Wishboard cart is a grouped shopping list, not a retailer checkout cart: retailer sites do not expose a universal add-to-cart/checkout API, so each retailer checkout remains separate. Demo cart contents are local to the current browser/device. Signed-in cart item IDs sync through Supabase user metadata, while local storage keeps the cart responsive and available offline. Wishboard does not process payments.
- The migration is additive and client-side events are append-only under the included RLS policies. Do not put a Supabase service-role key in this repository.

## Universal save (optional browser extension)
The `browser-extension/` folder contains a Chrome/Chromium Manifest V3 prototype. Load it unpacked from `chrome://extensions` with Developer mode enabled. Right-click a product page, link, or image and choose **Save page to Wishboard**. The app opens with available page metadata prefilled for review. The extension is optional and is not installed automatically by the website. See `browser-extension/README.md` for setup, privacy, and limitations.
