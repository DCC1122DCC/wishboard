# Wishboard — Save Anything (Chrome / Chromium extension)

This is an unpacked Manifest V3 extension prototype. It adds **Save page to Wishboard** to the browser's right-click menu. It reads the current page's title, URL, Open Graph/Twitter image metadata, and Product JSON-LD when available. If you right-click a product image or link, it prefers that image or link.

## Install for testing
1. Publish the current Wishboard app at `https://dcc1122dcc.github.io/wishboard/`.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Choose **Load unpacked** and select this `browser-extension` folder.
4. Open a product page, right-click, and choose **Save page to Wishboard**.
5. Wishboard opens with the details prefilled. Review them, add a price or image if needed, and save the pin.

## Privacy and limitations
- No product-page data is sent to a Wishboard server by the extension. It reads the page in the active tab and passes the selected metadata to the Wishboard URL you open.
- The extension requests `activeTab` and `scripting` so it can inspect a page only after you invoke the context-menu action. Its only host permission is the Wishboard GitHub Pages origin, needed to open the app.
- It does not bypass logins, paywalls, bot protection, or retailer restrictions.
- Some sites hide metadata or render product details dynamically; title/image/price may be incomplete. The Wishboard form is intentionally editable before saving.
- This is an unpacked testing extension, not yet a Chrome Web Store listing. The extension folder is separate from the GitHub Pages website files.
