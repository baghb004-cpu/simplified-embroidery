# Part 3: Product Inventory & Studio Presets

*Built from **tuxedosonline.com** (Gohar's family's store) on 2026-07-22, via the site's Yoast product sitemap. These presets power **Threadwell Studio** (the website) only — the Windows app does not use them.*

## What we pulled

The store runs on **WooCommerce**. Its public REST/Store API is locked down (403), but the **XML sitemap** is open, so we read the complete product list (names + product images) straight from `product-sitemap.xml` — no page-by-page scraping needed.

| Number | Meaning |
|---|---|
| **751** | Total products on the site (the full inventory, including drop-ship items) |
| **137** | Products that can take **custom embroidery** |
| **614** | Non-embroiderable (ties, cufflinks, shoes, socks, belts, suspenders, hats, gloves, pants, etc.) |

**Embroiderable breakdown:**

| Type | Count | Notes |
|---|---|---|
| **Dress / Tuxedo shirts** | 44 | Matches the site's own "Dress Shirts (43)" count. Men's, boys', women's. |
| **Tuxedos / Suits / Jackets** | 59 | Includes boys' white & ivory tuxedos, first-communion & **christening** sets. |
| **Vests** | 26 | Men's and boys'. |
| **Cummerbunds** | 3 | |
| **Pocket squares / hankies** | 5 | |
| **Christening / baptism line** | 2 (flagged) | e.g. *"Infant Boys White Baptism Christening 5-Piece Set"* — your "white outfit." |

> The full raw inventory (all 751, name + URL + image) is in [`data/all-products.json`](../data/all-products.json). The embroiderable subset, with a garment type, product line, image, and default placement, is in [`apps/studio/presets/products.json`](../apps/studio/presets/products.json).

## The store's category tree (top level)

Shirts (men's / boys' / women's · dress & tuxedo) · Tuxedos–Suits–Pants (men's / boys' / women's · incl. **boys' white/ivory tuxedos, first-communion & toddler suits**) · Vests & Cummerbunds · Ties (bow / neck) · Accessories (collar stays, lapel pins, gloves, hats, suspenders, socks/spats, belts/garters, button covers) · Jewelry (cufflinks/studs) · Shoes (men's / boys') · Occasions (weddings, homecoming, religious [confirmation, first communion], career/uniform, holiday) · Sale / New.

## Embroidery-area presets (per garment type)

Each embroiderable garment type has defined **panels** (where a name can go) with a starting embroidery-area size in millimeters. All areas fit the Baby Lock Destiny's 240 × 360 mm field.

| Type | Panel | Area (mm) | Default | Note |
|---|---|---|---|---|
| **Shirt** | Left chest | 110 × 70 | ✓ | Classic monogram spot |
| | Left cuff / Right cuff | 70 × 25 | | French/barrel cuff monogram |
| | Collar band | 45 × 18 | | Hidden collar monogram |
| | Center back yoke | 130 × 60 | | Below the collar |
| **Tuxedo/Suit/Jacket** | Inside breast lining | 130 × 70 | ✓ | The traditional interior monogram |
| | Exterior left chest | 90 × 55 | | Less common |
| | Full back (showpiece) | 200 × 260 | | Large arched name — christening showpiece |
| **Vest** | Center back | 180 × 140 | ✓ | Large back panel |
| | Lower left front | 80 × 55 | | Discreet monogram |
| **Cummerbund** | Front center | 120 × 45 | ✓ | Across the pleats |
| **Pocket square** | Corner | 45 × 45 | ✓ | Small initials |
| **Robe** | Left chest / Full back | 110 × 70 / 230 × 300 | ✓ | (type included for completeness) |

## Honest notes (read before production)

1. **Embroidery-area dimensions are industry-standard *estimates*** (every panel is tagged `estimated: true`). The store lists garment sizes, not the stitchable window on a collar or cuff. **Confirm each against a real garment before stitching for a customer.**
2. **Product names come from URL slugs.** Most are clean ("Slim Fit Notch Lapel Tuxedo"); some legacy items are cryptic codes ("Bntvest"). The Studio therefore leads with the **product photo** (visual recognition), which every product has. *Follow-up enhancement:* fetch each product page's real title to replace slug-names (≈137 pages).
3. **Classification is keyword-based** on the product slug. It's accurate for the bulk, but a few edge cases may be miscategorized — easy to correct in `products.json`.
4. **The christening/baptism line is small on this site** (2 clearly tagged). Boys' white/ivory tuxedos and first-communion suits (in the 59 jackets/suits) also serve that "white outfit" purpose.

## How the Studio uses this
`products.json` → the Studio's product picker (image + name + type). Picking a product loads its type's **panels** as tappable placement dots, and the panel's mm size scales the **live embroidery preview**. Rebuild anytime with `scripts/build-inventory.ps1`.
