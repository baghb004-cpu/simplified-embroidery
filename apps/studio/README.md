# Threadwell Studio — Netlify Order Portal

A locked-down **website** where trusted customers (**Gohar and their dad**) order embroidered items from the tuxedosonline.com catalog. Not a design tool — an ordering page that hides everything hard.

**Status: front-end built & tested, now with live 3D** ✅. The stitch-file generation + email backend is the next phase (see below).

## What's built
- `index.html` + `css/studio.css` + `js/app.js` — the static site (big-tile, mobile-friendly). Loads `presets/products.json` and drives the whole flow.
- `js/stage3d.js` + `vendor/three.module.min.js` — the **live 3D stage engine** (Three.js r160, vendored & pinned). Five procedural garment stages built entirely in code: **cuff** (the hero — tapered band, hem edges, cufflink buttons), **collar**, **cummerbund** (pleated), **fabric panel** (chest/back/lining — satin for jacket linings), and **pocket square**. The name/monogram is drawn with a thread-pattern texture and **stitches itself on with a travelling needle glint**; the key light drifts so the satin sheen moves; drag to spin, scroll/pinch to zoom; flat panels sway instead of spinning; the stage swings back to face you whenever the design changes. WebGL runs on PC/Mac/iPhone/Android; if it's unavailable the 2D photo preview takes over automatically (`prefers-reduced-motion` respected).
- `presets/products.json` — 137 embroiderable products classified by garment type + panel dimensions (built from the live catalog; see `docs/03`).
- `netlify.toml` — deploy config.

## The flow (working today)
1. **Sign in** (demo stub — real version = private magic-link for two allowed emails).
2. **Choose a product** — searchable grid of the real catalog, filterable by type (Shirts / Suits & Tuxedos / Vests / Cummerbunds / Pocket squares), each shown with its product photo.
3. **Choose placement** — the product photo shows tappable **dots** for that garment's panels (left chest, cuff, collar, inside lining, back showpiece…).
4. **Type the name or monogram** — two modes: **Full name** (English / Español / Armenian, Print or Cursive, with **live Armenian transliteration** — type "Gohar" and it becomes Armenian script live) or **Monogram** (up to 3 letters; Classic auto-applies etiquette — the last-name initial goes big in the middle; Straight and Script styles too). Thread **and fabric** color pickers (fabric auto-guessed from the product name).
5. **Watch it in 3D** — the design stitches itself onto the live 3D garment stage in real time as they type.
6. **Review & send** — order summary. *(Demo: the file/email step is stubbed.)*

## Run locally
It's a static site that `fetch`es `presets/products.json`, so it needs to be served over HTTP (not opened as a `file://`). Any static server works, e.g. from this folder:
```bash
npx serve .
```
Then open the printed URL.

## Deploy to Netlify
1. Connect the GitHub repo `baghb004-cpu/simplified-embroidery` in Netlify.
2. Set **Base directory** = `apps/studio`, **Publish directory** = `apps/studio`, no build command.
3. Deploy. (Product images hotlink from tuxedosonline.com.)

## The next phase (backend — not built yet)
Per `docs/02`, pressing **Send** should: call a small **render worker** (Python + the shared `engine/`) that turns the name into a real `.pes`, render a preview, and **email the file + preview + order details to the owner and their mom** — with the recipient list and the two-customer allowlist enforced server-side. The Netlify function is only the traffic cop; the embroidery engine lives on its own worker (it won't fit in a Netlify function).

## Honest notes
- Placement **dots are approximate** positions on the product photo (per garment type), and panel sizes are **industry-standard estimates** — good for preview, confirm before production.
- Cursive uses system script fonts for preview; production needs licensed embroidery fonts (and the real stitch engine). Armenian transliteration is approximate (Eastern).
- Legacy product names come from URL slugs; the photo is the main way to recognize a product. Real-title enrichment is a follow-up.
