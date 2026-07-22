# Threadwell 🧵

**Beautiful embroidery, made wonderfully simple.**

> **🤝 New session? Cloud sandbox? START WITH [`HANDOFF.md`](HANDOFF.md)** — the portable
> project brain: current state, both repos, all decisions, environment notes, next phases.

Threadwell is a project to replace the overwhelming professional embroidery software (Floriani Total Control U) with something a 60–70 year old can use as easily as an iPhone — built specifically for a **Baby Lock Destiny** machine.

There are **two front doors, one shared engine**:

| Front door | What it is | Where it runs | Folder |
|---|---|---|---|
| **Threadwell** | The simple app Mom uses to prepare & export designs | **Native Windows desktop/laptop program** | [`apps/windows/`](apps/windows/) |
| **Threadwell Studio** | An order page where trusted customers type a name onto a product | **Website on Netlify** | [`apps/studio/`](apps/studio/) |
| **The engine** | The shared "name → stitches → PES file" brain used by both | Python (in the app + on a render worker) | [`engine/`](engine/) |

## The design promise
Big tiles, big letters and numbers, near-black on white, **green only for the "go" action**, and *you truly cannot break it.* Full rationale and the screen-by-screen design live in the docs.

## 📁 Repository map
```
Threadwell/
├─ docs/                         ← the full design blueprint (read these first)
│  ├─ 01-blueprint.md            ← Part 1: the simple app, design system, industry-headache fixes
│  ├─ 02-languages-and-studio.md ← Part 2: Armenian/Spanish/English lettering + the Studio portal
│  └─ 03-product-inventory-and-presets.md  ← ⏳ awaiting the product website URL
├─ prototype/
│  └─ threadwell-prototype.html  ← a working, tappable feel-mockup (open in a browser)
├─ apps/
│  ├─ windows/                   ← the Windows desktop app (Tauri) — not built yet
│  └─ studio/                    ← the Netlify order site — not built yet
│     └─ presets/                ← per-product embroidery presets (from the inventory)
└─ engine/                       ← the shared Python name→PES lettering engine — not built yet
```

## Status
- ✅ **Design docs** (Part 1 & Part 2) — complete.
- ✅ **Clickable prototype** — done (`prototype/threadwell-prototype.html`).
- ⏳ **Product inventory & presets** — blocked, needs the product website URL (see `docs/03-...`).
- ⬜ **Shared engine, Windows app, Studio site** — designed, not yet built.

## Machine facts we build around (Baby Lock Destiny / Destiny II)
- Native design format: **PES** (carries thread colors). Also reads DST (no colors), PEC, PHC.
- **No wireless.** Designs transfer by **USB stick (FAT32)**, SD card, or USB-B cable. The last step is always a physical copy — designed to be foolproof.
- Largest embroidery field: **240 × 360 mm (9.5" × 14")**. Every design must also fit the specific hoop in use — the "too big for the hoop" check is a core feature.

## Key build notes
- File I/O: **pyembroidery** (reads/writes PES, preserves colors).
- Stitch generation: **Ink/Stitch** algorithms (only mature open-source option; **GPL** — a licensing decision to make early).
- Windows app shell: **Tauri** (reuses the prototype's web UI, adds native USB/file access).
- **Armenian lettering is the standout feature** — almost no embroidery software supports it. It's a one-time hand-build of ~76 letters. Armenian *cursive* is genuine hard-R&D; ship print first.

_See `docs/` for the complete reasoning behind every choice above._
