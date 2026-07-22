# Threadwell Engine — the shared "name → stitches → PES" brain

**One engine, two front doors.** The single most valuable, most reused piece. Built once; used by both the Windows app and the Studio's render worker.

## What it does
`name + language + style + size  →  machine-safe PES file (+ preview image)`

- **Languages:** English, Spanish (same Latin family, full diacritics `á é í ó ú ü ñ ¿ ¡`), and **Armenian** (the standout — a one-time ~76-letter hand-build, including the `ու` pair and `և` ligature).
- **Styles:** PRINT (block) and CURSIVE (joined script — hand-digitized fonts only, never on-the-fly conversion).
- **Armenian input:** phonetic transliteration (`Gohar → Գոհար`), saved names, or on-screen keyboard.

## How it's built — from `docs/02-languages-and-studio.md`
1. **Letter shapes** come from ready-made, hand-digitized satin letters (best quality); a font-outline→satin fallback exists but is draft-only.
2. **Word layout** — print letters side by side; cursive letters overlap at joins with per-pair spacing and one clean stitch path. Underlay by stroke width; lock-stitches forced on Spanish accents.
3. **Write the file** — **pyembroidery** writes the PES with colors baked in.

## Language / feasibility
- Python (matches pyembroidery + Ink/Stitch). Runs embedded in the Windows app and standalone on the Studio render worker.
- **Licensing:** leaning on Ink/Stitch likely makes the engine **GPL** — decide early.

_Not built yet — this folder is a placeholder with the plan._
