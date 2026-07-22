# Part 3: Product Inventory & Studio Presets

> **STATUS: ⏳ BLOCKED — needs the product website URL.**
>
> This document will hold the full inventory of every embroiderable product sold on the owner's website (including drop-ship items), with the dimensions and embroidery-area presets that power **Threadwell Studio**'s product picker and live animated preview.
>
> **These presets are for the Studio website ONLY. The Windows desktop app does not include them.**

## What I will capture for every product (once I have the URL)

For each product on the site that *can* take custom embroidery, the inventory will record:

| Field | Example | Notes |
|---|---|---|
| `product_name` | "Boys White Christening Suit — 5pc" | As listed on the site |
| `sku` / `id` | e.g. `BAP-500` | For matching orders |
| `category` | Baptism / Shirt / Polo / Baby / Hat / Towel… | Grouping in the picker |
| `is_dropship` | true / false | Flagged separately |
| `source_url` | link to the product page | Traceability |
| `embroiderable` | true / false | Some items can't be embroidered — excluded from Studio |
| `panels` | jacket back, left chest, collar, cuff… | The spots a name can go |
| `panel_dimensions` | e.g. jacket back ≈ 200 × 250 mm | The embroidery **area**, per panel |
| `max_design_mm` | per panel | Must also fit the Destiny hoop |
| `default_placement` | e.g. "jacket back, arched" | Sensible default |
| `preview_asset` | image/vector of the garment | Drives the animated preview |

## Honest notes to resolve with the owner
1. **Embroidery-area dimensions are rarely published.** Product pages list garment *sizes* (e.g. chest 20"), not the printable/embroiderable *window* on each panel. Where the site doesn't state it, I will fill in **industry-standard embroidery placements** (e.g. left chest ≈ 4" wide, centered ~7" down from the shoulder seam) and flag each as `estimated` for the owner to confirm.
2. **"Every possible embroiderable product."** I'll include every item that can realistically be embroidered and exclude ones that can't (e.g. hard goods, some synthetics). Drop-ship items are included and flagged.
3. **Preview art.** The live animated preview needs a clean image or vector of each garment. I'll use product photos where usable and note where a better asset is needed.

## Output format
The finished inventory will be saved as **both**:
- `docs/03-product-inventory-and-presets.md` (human-readable, this file), and
- `apps/studio/presets/products.json` (machine-readable presets the Studio loads).
