#!/usr/bin/env python3
"""Applies the two Wishboard edits to index.html in place (backup saved as index.backup.html).

Usage:  python3 patch_index.py            (run in the same folder as index.html)
        python3 patch_index.py path/to/index.html
"""
import sys, shutil

path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
with open(path, "r", encoding="utf-8", newline="") as f:
    src = f.read()
shutil.copyfile(path, path.replace(".html", ".backup.html"))

crlf = "\r\n" in src
text = src.replace("\r\n", "\n")

NEW_EDIT_FIELDS = r'''function EditPinFields({ item, onChange, showUpload }) {
  // Inline edit form used inside the pin detail sheet — reuses the same
  // field set as pin creation, but patches the existing record.
  const handlePhotoFile = (e) => {
    const input = e.target;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // downscale to 1200px max, same size/quality as the existing photo upload
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        onChange({ image: c.toDataURL("image/jpeg", 0.85) });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    input.value = "";
  };

  return (
    <>
      <div className="wb-field">
        <label>What is it?</label>
        <input type="text" value={item.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div className="wb-field">
        <label>Price</label>
        <input
          type="number" inputMode="decimal" step="0.01" min="0"
          value={item.price ?? ""}
          onChange={(e) => onChange({ price: e.target.value })}
        />
      </div>
      <div className="wb-field">
        <label>Link to the product</label>
        <input type="text" value={item.link || ""} onChange={(e) => onChange({ link: e.target.value })} />
      </div>
      <div className="wb-field">
        <label>Image URL</label>
        <input
          type="text"
          value={item.image === POSTIT_IMAGE || (showUpload && (item.image || "").startsWith("data:")) ? "" : (item.image || "")}
          onChange={(e) => onChange({ image: e.target.value })}
        />
      </div>
      {showUpload ? (
        <div style={{ marginBottom: 14 }}>
          {item.image && item.image !== POSTIT_IMAGE ? (
            <img className="wb-preview" src={item.image} alt="Preview" style={{ marginTop: 0, marginBottom: 8, width: 130, height: 130 }} />
          ) : null}
          <label className="wb-cancel-btn" style={{ display: "block", textAlign: "center", cursor: "pointer", position: "relative" }}>
            Upload Photo
            <input className="wb-file-hidden" type="file" accept="image/*" onChange={handlePhotoFile} />
          </label>
        </div>
      ) : null}
    </>
  );
}

'''

# Edit 1a: replace the whole EditPinFields function
start = text.index("function EditPinFields({ item, onChange }) {")
end = text.index("function PinDetailModal(")
text = text[:start] + NEW_EDIT_FIELDS + text[end:]

# Edit 1b: pass showUpload only for Quick Notes
old = "<EditPinFields item={draftItem} onChange="
assert text.count(old) == 1, "EditPinFields call not found"
text = text.replace(old, "<EditPinFields item={draftItem} showUpload={isPostit(item)} onChange=")

# Edit 2: drop handlers on custom tabs
old = '<div key={ct.id} className={`wb-tab ${active ? "active-custom" : ""}`} onClick={() => handleTabChange(ct.id)}>'
assert text.count(old) == 1, "custom tab div not found"
new = '''<div
              key={ct.id}
              className={`wb-tab ${active ? "active-custom" : ""} ${dragOverTab === ct.id ? "wb-tab-dragover" : ""}`}
              onClick={() => handleTabChange(ct.id)}
              onDragOver={(e) => handleTabDragOver(e, ct.id)}
              onDragLeave={() => handleTabDragLeave(ct.id)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverTab(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) handleMoveCustomTab(id, ct.id);
              }}
            >'''
text = text.replace(old, new)

if crlf:
    text = text.replace("\n", "\r\n")
with open(path, "w", encoding="utf-8", newline="") as f:
    f.write(text)
print("Done. Patched", path)
