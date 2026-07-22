# Part 4: The Business Model — Lusik & Sons as the Embroidery Vendor

*Decided 2026-07-22 with the owner. This reframes who the Studio is for.*

## The arrangement (in plain terms)

**Lusik & Sons** (lusikandsons.com — Mom's brand, hand-embroidered Armenian alphabet blankets, bibs & towels, Southern California) becomes the **contract embroidery vendor** for **Tuxedos Online** (tuxedosonline.com — Gohar & Vrej's formalwear shop).

- Tuxedos Online places embroidery orders through the Studio under their **company account**.
- Lusik & Sons produces the work and **invoices per order** (auto-numbered `LS-2026-001…`).
- The Studio is also open to the **public as quote requests** — anyone can design on a household item and submit; Mom prices it and replies. No online payment processing needed to start.

This is a standard B2B contract-embroidery relationship, with the Studio as the order-intake desk.

## Decisions locked in

| Question | Decision |
|---|---|
| Site identity | **Separate site under the family domain** — deploy the Studio as its own Netlify site at a subdomain (e.g. `orders.lusikandsons.com`), linked from lusikandsons.com's menu. (Note: lusikandsons.com is itself already hosted on Netlify — same account, two sites.) |
| Who can order | **Company account (Gohar & Vrej) + public quote requests.** Company orders are invoiced; public submissions are quotes Mom prices first. |
| Invoicing | **One invoice per order**, auto-numbered `LS-2026-###`, attached to the order email. |
| Catalog expansion | **Linens & towels** household line added (10 items): bath/hand/kitchen towels, bathrobe, blanket/throw, pillowcase pair, cloth napkin set, table runner, apron — plus **The Armenian Alphabet Blanket (Lusik's Signature)**. Baby/keepsake and bags categories were offered and deferred. |

## Why a subdomain (the reasoning)

- Mom's site keeps its calm storefront-and-story feel; the Studio is the working order desk.
- Same brand = trust transfers ("From Lusik's Workshop") without building a second brand.
- Separate Netlify site = the app deploys independently, and opening it to more partners or the public later costs nothing.
- DNS setup is one CNAME record on the existing domain.

## What the Studio now reflects (built & tested)

- Rebranded **"Lusik & Sons — Custom Embroidery Studio."**
- Two sign-in paths: **Tuxedos Online — Company Account** and **"I'm new — request a custom quote."**
- Catalog = the 137 Tuxedos Online embroiderables **+ 10 household items** (with a "Household (10)" filter chip; household items display as icon tiles and use the 3D fabric stages — towels/robes render in **terry cloth**).
- Company checkout stamps an **invoice number** into the order summary; public checkout ends as a **quote request**.

## Still stubbed (the honest list)

- Real PES generation, the invoice **PDF** itself, and the emails (design + invoice to Lusik & Sons and the company account) — that's the `engine/` + Netlify function + render worker phase.
- Real authentication (magic-link allowlist for the company account; simple contact capture for public quotes).
- Public quote flow should collect the requester's **name/email/phone** before Send (one extra field screen) — small addition, not yet built.
- Household panel dimensions are industry-standard estimates — Mom should confirm against her actual blanks.
