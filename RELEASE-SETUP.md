# Wishboard first update — GitHub Pages release

This package preserves the existing single-page Wishboard app and its three themes. It adds a private activity foundation, a purchase-reflection checkpoint, an Insights view, per-pin view counts, and password-reset access.

## What changed
- **Cleaner pin editing:** removed the duplicate photo preview from the edit form; the existing pin photo remains visible above, with one compact **Replace** button to choose a new image.

- **Last Chance to Transcend:** clicking a saved product link opens a short, optional reflection checkpoint. The user can stay on Wishboard or continue to the retailer. It does not prevent purchasing.
- **Insights:** shows current wishlist value, confirmed purchase events, today's / last 7 days' / this month's purchase totals, pin opens, retailer-page visits, and the most-opened pin.
- **Pin views:** intentional opens are counted; the count appears in the pin detail.
- **Purchase activity:** marking a pin Purchased records a dated amount/title snapshot. Existing item and tab records are not rewritten by the migration.
- **Forgot password:** uses Supabase's password-reset email flow.
- **PWA cache:** service-worker cache version is bumped so installed clients fetch the new app files.

## Important: run the Supabase migration first

1. Open your Supabase project and go to **SQL Editor**.
2. Open `supabase-item-activity-migration.sql` from this package.
3. Review it, then run it once.
4. The migration creates only `public.item_activity`, indexes, and user-scoped RLS policies. It does not modify or delete `items`, `tabs`, or existing user data.
5. Confirm the new table has RLS enabled and the two policies (`select own item activity`, `insert own item activity`) exist.

The app's Insights view will show a setup note until the migration has been run. Existing Wishboard pins continue to work without the activity table, but analytics and reflection-event history need it.

## Publish to the existing GitHub Pages repository

GitHub Pages does not unpack a ZIP that is uploaded as a file. Extract this ZIP on your computer, then:

1. Open the existing repository that publishes `https://dcc1122dcc.github.io/wishboard/`.
2. Upload the **contents** of the extracted package folder into the repository's published root (the same level where the current `index.html` lives). Do not upload the ZIP itself and do not create an extra nested `wishboard-main` folder.
3. Keep the existing repository settings and GitHub Pages source/branch unchanged.
4. Commit the files. GitHub Pages will publish the new version after the commit is processed.
5. Visit the site and hard-refresh once. If an installed PWA still shows the previous version, close/reopen it after the service worker refreshes.

If your repository contains additional files not included in this package, do not delete them. Replace the matching app files and add the new SQL/README files.

## Test checklist after publishing

- Sign in and confirm existing pins and custom tabs are present.
- Open a pin and confirm its view count appears in the detail.
- Click a retailer link and confirm the reflection checkpoint appears; test both choices.
- Mark a test pin Purchased and confirm Insights updates.
- Switch between Original, Consumerist, and Dalí themes.
- Test Forgot password using an email address on your account. Ensure the reset redirect URL is allowed in Supabase Auth URL Configuration.

## Notes and limitations

- Historical views and purchases cannot be reconstructed. Activity starts after this update and migration are installed.
- “Purchase confirmed” means the user marked the pin Purchased in Wishboard. Wishboard does not verify an actual retailer transaction or connect to a bank.
- Retailer links open the saved product page, not a unified checkout. Wishboard does not process payments.
- The migration is additive and client-side events are append-only under the included RLS policies. Do not put a Supabase service-role key in this repository.
