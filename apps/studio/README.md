# Threadwell Studio — Netlify Order Portal

A tiny, locked-down **website on Netlify** where two trusted customers (**Gohar and their dad**) order embroidered items. Not a design tool — an ordering page that hides everything hard.

## The flow — from `docs/02-languages-and-studio.md`
1. **Sign in** (passwordless magic-link; hard two-email allowlist).
2. **Choose a product** from the owner's real catalog (see `presets/products.json`).
3. **Choose the spot** — tap a placement dot on the garment.
4. **Type the name** (English / Español / Հայերեն, print or cursive).
5. **Live animated preview** of the embroidery on the chosen panel (collar, back, cuff, chest…).
6. **Send** → the system auto-generates the PES, renders a preview, and **emails both to the owner and their mom**.

## Architecture (honest split)
- **Front end:** static site on **Netlify** (big-tile screens + the animated preview).
- **Traffic cop:** a thin Netlify function — validates the customer + order, calls the worker, saves the order, sends the email. It does **not** generate stitches.
- **Render worker:** a **separate small Python service** (Fly.io / Render / Railway) running the shared `engine/` — because the embroidery engine won't fit inside a Netlify function.
- **Email:** a transactional service (Resend / SendGrid / Postmark) from a verified domain; recipients locked server-side to the owner + mom.
- **Storage:** Netlify Blobs (or Supabase for searchable order history).

## Presets
`presets/products.json` — per-product embroidery panels + dimensions + preview art, generated from the product-inventory analysis (`docs/03-product-inventory-and-presets.md`). **Studio-only** — the Windows app does not use these.

_Not built yet — this folder is a placeholder with the plan._
