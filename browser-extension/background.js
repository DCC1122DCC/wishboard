const WISHBOARD_URL = "https://dcc1122dcc.github.io/wishboard/";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => chrome.contextMenus.create({
    id: "wishboard-save-page",
    title: "Save page to Wishboard",
    contexts: ["page", "link", "image"]
  }));
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "wishboard-save-page" || !tab?.id) return;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [info.linkUrl || "", info.srcUrl || ""],
      func: (clickedLink, clickedImage) => {
        const meta = (...keys) => {
          for (const key of keys) {
            const node = document.querySelector(`meta[property="${key}"],meta[name="${key}"]`);
            if (node?.content) return node.content.trim();
          }
          return "";
        };
        const absolute = (value) => {
          if (!value) return "";
          try { const u = new URL(value, location.href); return /^https?:$/.test(u.protocol) ? u.href : ""; }
          catch { return ""; }
        };
        let jsonTitle = "", jsonImage = "", jsonPrice = "";
        const walk = (node) => {
          if (!node || typeof node !== "object") return;
          if (Array.isArray(node)) { node.forEach(walk); return; }
          const type = node["@type"];
          if ((type === "Product" || (Array.isArray(type) && type.includes("Product"))) && !jsonTitle) {
            jsonTitle = typeof node.name === "string" ? node.name : "";
            const image = Array.isArray(node.image) ? node.image[0] : node.image;
            jsonImage = typeof image === "string" ? image : image?.url || "";
            const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
            jsonPrice = offers?.price || offers?.lowPrice || "";
          }
          Object.values(node).forEach(walk);
        };
        for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
          try { walk(JSON.parse(script.textContent)); } catch {}
          if (jsonTitle) break;
        }
        const title = meta("og:title", "twitter:title") || jsonTitle || document.querySelector("h1")?.textContent?.trim() || document.title || "Saved product";
        const image = absolute(clickedImage) || absolute(meta("og:image", "twitter:image")) || absolute(jsonImage);
        const price = meta("product:price:amount", "og:price:amount") || String(jsonPrice || "");
        const url = absolute(clickedLink) || location.href;
        return { title: title.slice(0, 240), image, price: price.slice(0, 16), url, source: location.hostname };
      }
    });
    const item = results?.[0]?.result;
    if (!item?.url) throw new Error("No page URL found");
    const handoff = encodeURIComponent(JSON.stringify(item));
    await chrome.tabs.create({ url: `${WISHBOARD_URL}?wb_save=${handoff}` });
  } catch (error) {
    console.error("Wishboard save failed", error);
  }
});
