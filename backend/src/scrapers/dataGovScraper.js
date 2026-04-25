/**
 * dataGovScraper.js
 * Fetches Mandi prices from the official data.gov.in API (Agmarknet dataset).
 * No headless browser needed — pure HTTP JSON API.
 *
 * API Docs: https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
 * Free registration at: https://data.gov.in → "Get API Key"
 *
 * Returns: { success: boolean, data: [], errors: [], scraperUsed: "datagov" }
 */

import axios from "axios";

const API_KEY = process.env.DATA_GOV_API_KEY || "579b464db66ec23bdd0000017e2a44d05d734e8db66b1e01f1aba714";
// ↑ This is the public demo key — works but rate-limited to ~1000 req/day
// Register free at data.gov.in to get your own unlimited key

const BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

const STATES_TO_FETCH = [
  "Maharashtra",
  "Punjab",
  "Karnataka",
  "Uttar Pradesh",
  "Rajasthan",
  "Madhya Pradesh",
  "Gujarat",
  "Haryana",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch one page of records for a state
 */
const fetchStateData = async (stateName, offset = 0, limit = 100) => {
  const params = {
    "api-key": API_KEY,
    format: "json",
    limit,
    offset,
    "filters[State.keyword]": stateName,
  };

  const res = await axios.get(BASE_URL, {
    params,
    timeout: 20000,
    headers: { Accept: "application/json" },
  });

  return res.data;
};

/**
 * Parse a data.gov.in record into our MandiPrice schema shape
 */
const parseRecord = (rec) => {
  const minPrice  = parseFloat(rec["Min Price"]  || rec.min_price  || 0);
  const maxPrice  = parseFloat(rec["Max Price"]  || rec.max_price  || 0);
  const modalPrice = parseFloat(rec["Modal Price"] || rec.modal_price || 0);

  if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(modalPrice)) return null;
  if (minPrice === 0 && maxPrice === 0 && modalPrice === 0) return null;

  const rawDate = rec["Arrival Date"] || rec.arrival_date || rec.date || new Date().toISOString();
  // Date format from API: "25/Apr/2025" or "25-04-2025"
  let date;
  try {
    date = new Date(rawDate.replace(/(\d{2})\/([A-Za-z]{3})\/(\d{4})/, "$2 $1 $3"));
    if (isNaN(date.getTime())) date = new Date();
  } catch {
    date = new Date();
  }

  return {
    state:      (rec["State Name"]  || rec.state       || "").toLowerCase().trim(),
    district:   (rec["District Name"] || rec.district  || "").toLowerCase().trim(),
    mandi:      (rec["Market Name"] || rec.market_name || "").toLowerCase().trim(),
    crop:       (rec["Commodity"]   || rec.commodity   || "").toLowerCase().trim(),
    minPrice,
    maxPrice,
    modalPrice,
    date,
    source: "scraped",
    unit: "₹/quintal",
  };
};

/**
 * Main export
 */
export const runDataGovScraper = async () => {
  const result = {
    success: false,
    data: [],
    errors: [],
    scraperUsed: "datagov",
  };

  console.log("🌐 [DataGov] Starting data.gov.in Agmarknet fetch...");

  for (const state of STATES_TO_FETCH) {
    try {
      // Fetch up to 200 records per state (2 pages)
      for (const offset of [0, 100]) {
        const response = await fetchStateData(state, offset, 100);
        const records = response?.records || response?.data || [];

        if (!Array.isArray(records) || records.length === 0) break;

        for (const rec of records) {
          const parsed = parseRecord(rec);
          if (parsed && parsed.mandi && parsed.crop) {
            result.data.push(parsed);
          }
        }

        console.log(`  ✔ [DataGov] ${state} offset=${offset}: ${records.length} records`);

        if (records.length < 100) break; // No more pages
        await sleep(300); // Polite delay
      }
    } catch (err) {
      console.error(`  ✘ [DataGov] ${state}: ${err.message}`);
      result.errors.push({ stage: "fetch", message: `${state}: ${err.message}` });
    }

    await sleep(500);
  }

  result.success = result.data.length > 0;
  console.log(`🌐 [DataGov] Done. Total rows: ${result.data.length}`);
  return result;
};
