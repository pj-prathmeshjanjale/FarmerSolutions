/**
 * mandiDataCleaner.js
 * Cleaning & normalization pipeline for raw scraped mandi price rows.
 *
 * Responsibilities:
 *  1. Normalize crop/mandi/state names (lowercase, trim, alias mapping)
 *  2. Parse prices to Numbers; skip rows with NaN
 *  3. Validate: minPrice ≤ modalPrice ≤ maxPrice (fix minor inversions)
 *  4. Remove duplicates by { crop, mandi, date } (keep first)
 *  5. Return { cleaned[], skipped, report }
 */

// --- Crop alias normalization map ---
// Maps common scraped variations to canonical lowercase name
const CROP_ALIASES = {
  "paddy(dpr)":      "paddy",
  "paddy (dpr)":     "paddy",
  "paddy(common)":   "paddy",
  "rice":            "paddy",
  "soya bean":       "soyabean",
  "soy bean":        "soyabean",
  "soybean":         "soyabean",
  "ground nut":      "groundnut",
  "ground-nut":      "groundnut",
  "sun flower":      "sunflower",
  "mustard(black)":  "mustard",
  "rape seed":       "mustard",
  "wheat(pba)":      "wheat",
  "maize(new)":      "maize",
  "gram(whole)":     "gram",
  "chick pea":       "gram",
  "tur (arhar)":     "tur",
  "arhar":           "tur",
  "pigeon pea":      "tur",
  "urad(whole)":     "urad",
  "black gram":      "urad",
  "moong(whole)":    "moong",
  "green gram":      "moong",
  "bajra(whole)":    "bajra",
  "pearl millet":    "bajra",
  "jowar(white)":    "jowar",
  "sorghum":         "jowar",
  "ragi (finger millet)": "ragi",
  "finger millet":   "ragi",
  "potato(new)":     "potato",
  "onion(big)":      "onion",
  "tomato big (local)": "tomato",
  "cotton(non-bt)":  "cotton",
  "cotton(bt)":      "cotton",
  "cotton seed":     "cotton",
};

/**
 * Normalize a crop name using alias map + general cleanup
 */
const normalizeCrop = (raw) => {
  if (!raw) return null;
  const lower = raw.toString().toLowerCase().trim();
  return CROP_ALIASES[lower] || lower;
};

/**
 * Normalize mandi/state/district string
 */
const normalizeLocation = (raw) => {
  if (!raw) return "";
  return raw.toString().toLowerCase().trim().replace(/\s+/g, " ");
};

/**
 * Normalize a date to midnight UTC for the given day
 */
const normalizeDate = (raw) => {
  if (!raw) return new Date();
  const d = new Date(raw);
  if (isNaN(d.getTime())) return new Date();
  // floor to day
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Clean a single raw price row.
 * Returns the cleaned object or null if it should be skipped.
 */
const cleanRow = (raw) => {
  // 1. Normalize strings
  const crop   = normalizeCrop(raw.crop);
  const mandi  = normalizeLocation(raw.mandi);
  const state  = normalizeLocation(raw.state);
  const district = normalizeLocation(raw.district);
  const date   = normalizeDate(raw.date);

  // 2. Require essential fields
  if (!crop || !mandi || !state) return null;

  // 3. Parse prices
  const minPrice   = typeof raw.minPrice   === "number" ? raw.minPrice   : parseFloat(String(raw.minPrice  ).replace(/,/g, ""));
  const maxPrice   = typeof raw.maxPrice   === "number" ? raw.maxPrice   : parseFloat(String(raw.maxPrice  ).replace(/,/g, ""));
  const modalPrice = typeof raw.modalPrice === "number" ? raw.modalPrice : parseFloat(String(raw.modalPrice).replace(/,/g, ""));

  if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(modalPrice)) return null;
  if (minPrice < 0 || maxPrice < 0 || modalPrice < 0)          return null;
  if (minPrice === 0 && maxPrice === 0 && modalPrice === 0)     return null;

  // 4. Validate price ordering — fix small inversions (within 5%)
  let min = minPrice;
  let max = maxPrice;
  let modal = modalPrice;

  if (min > max) {
    // Swap min/max if inverted
    [min, max] = [max, min];
  }

  // Clamp modal within [min, max]
  if (modal < min) modal = min;
  if (modal > max) modal = max;

  return {
    crop,
    mandi,
    state,
    district,
    minPrice:   Math.round(min   * 100) / 100,
    maxPrice:   Math.round(max   * 100) / 100,
    modalPrice: Math.round(modal * 100) / 100,
    date,
    source: raw.source || "scraped",
    unit: raw.unit || "₹/quintal"
  };
};

/**
 * Main export: clean an array of raw scraped rows
 * @param {Array} rawData - Array of raw row objects from scrapers
 * @returns {{ cleaned: Array, skipped: number, report: Object }}
 */
export const cleanMandiData = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { cleaned: [], skipped: 0, report: { input: 0, cleaned: 0, skipped: 0 } };
  }

  const seen = new Set();
  const cleaned = [];
  let skipped = 0;

  for (const row of rawData) {
    const clean = cleanRow(row);

    if (!clean) {
      skipped++;
      continue;
    }

    // Deduplicate: { crop, mandi, date } must be unique within this batch
    const dateKey = clean.date.toISOString().split("T")[0];
    const key = `${clean.crop}|${clean.mandi}|${dateKey}`;

    if (seen.has(key)) {
      skipped++;
      continue;
    }

    seen.add(key);
    cleaned.push(clean);
  }

  const report = {
    input:   rawData.length,
    cleaned: cleaned.length,
    skipped
  };

  console.log(`🧹 [Cleaner] ${report.input} in → ${report.cleaned} clean, ${report.skipped} skipped`);

  return { cleaned, skipped, report };
};
