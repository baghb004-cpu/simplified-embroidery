# Threadwell — Windows Desktop App

The main program **Mom** uses. A **native Windows desktop/laptop application** (installable `.exe`/`.msi`) — not a website, not a phone app. It should *feel* as easy as an iPhone, but it runs on the Windows computer that feeds the Baby Lock Destiny.

## Planned stack
- **Tauri** (Rust shell + web UI) — lets us reuse the big-tile interface from `prototype/threadwell-prototype.html` while getting **native USB/file access** for foolproof PES export. (Electron is the fallback if Tauri friction is high.)
- Calls the shared **[`engine/`](../../engine/)** for any lettering → PES work.

## MVP scope ("Prepare & Transfer") — from `docs/01-blueprint.md`
1. Open a design she already owns (PES/DST) and show an accurate preview.
2. **Block "too big for the hoop"** in plain language (the #1 error).
3. Resize / rotate / mirror / reposition / combine; reorder colors to cut thread changes.
4. **Add a Name** (English/Spanish/Armenian, print/cursive) via the shared engine.
5. Export a machine-safe **PES** (short filename) and write it to a **FAT32 USB stick**.

## Explicitly NOT here
- The Studio's per-product presets and the animated garment preview live in **`apps/studio/`**, not in this app.

_Not built yet — this folder is a placeholder with the plan._
