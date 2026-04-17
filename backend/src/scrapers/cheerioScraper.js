/**
 * cheerioScraper.js
 * Fallback scraper using Axios + Cheerio.
 * Targets Agmarknet's older CSV/HTML data export endpoints
 * which return semi-static HTML tables (no JS rendering required).
 *
 * Returns: { success: boolean, data: [], errors: [], scraperUsed: "cheerio" }
 * NEVER throws.
 */

import axios from "axios";
import * as cheerio from "cheerio";

const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 20000; // 20 seconds

// Agmarknet static/export endpoints (older portal URLs that return HTML tables)
// These may break if the site restructures, but serve as best-effort fallback
const STATIC_ENDPOINTS = [
  {
    url: "https://agmarknet.gov.in/PriceAndArrivals/CommodityDailyStateWise.aspx",
    stateCode: "MH",
    stateName: "Maharashtra"
  },
  {
    url: "https://agmarknet.gov.in/PriceAndArrivals/CommodityDailyStateWise.aspx",
    stateCode: "PB",
    stateName: "Punjab"
  },
  {
    url: "https://agmarknet.gov.in/PriceAndArrivals/CommodityDailyStateWise.aspx",
    stateCode: "KA",
    stateName: "Karnataka"
  }
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Parse an HTML table with Cheerio.
 * Returns an array of row objects.
 */
const parseHtmlTable = ($, tableEl, stateName) => {
  const rows = [];
  const headers = [];

  $(tableEl).find("thead tr th, tr th").each((_, th) => {
    headers.push($(th).text().trim().toLowerCase());
  });

  $(tableEl).find("tbody tr").each((_, tr) => {
    const cells = [];
    $(tr).find("td").each((_, td) => {
      cells.push($(td).text().trim());
    });

    if (cells.length < 6) return;

    // Try to extract prices from common column positions
    // Agmarknet table columns: Commodity | Market | Min | Max | Modal | Date
    const commodity = cells[0] || cells[1] || "";
    const market    = cells[1] || cells[2] || "";
    const minPrice  = parseFloat(cells[2]?.replace(/,/g, "") || cells[3]);
    const maxPrice  = parseFloat(cells[3]?.replace(/,/g, "") || cells[4]);
    const modalPrice = parseFloat(cells[4]?.replace(/,/g, "") || cells[5]);
    const dateStr   = cells[5] || cells[6] || new Date().toISOString();

    if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(modalPrice)) return;
    if (!commodity || !market) return;

    rows.push({
      state:      stateName.toLowerCase(),
      district:   "",
      mandi:      market.trim().toLowerCase(),
      crop:       commodity.trim().toLowerCase(),
      minPrice,
      maxPrice,
      modalPrice,
      date:       new Date(dateStr) || new Date(),
      source:     "scraped"
    });
  });

  return rows;
};

/**
 * Fetch and parse one static endpoint
 */
const scrapeStaticEndpoint = async (endpoint) => {
  const rows = [];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(endpoint.url, {
        timeout: REQUEST_TIMEOUT,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9"
        },
        params: {
          StateCode: endpoint.stateCode,
          Action: "GetData"
        }
      });

      const $ = cheerio.load(response.data);

      // Find all tables on the page
      const tables = $("table");
      tables.each((_, table) => {
        const parsed = parseHtmlTable($, table, endpoint.stateName);
        rows.push(...parsed);
      });

      if (rows.length > 0) break; // Got data — done

    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await sleep(attempt * 3000);
      }
    }
  }

  return rows;
};

/**
 * Main export: run the Cheerio fallback scraper
 * Returns { success, data[], errors[], scraperUsed }
 */
export const runCheerioScraper = async () => {
  const result = {
    success: false,
    data: [],
    errors: [],
    scraperUsed: "cheerio"
  };

  console.log("🔄 [Cheerio] Running fallback scraper...");

  for (const endpoint of STATIC_ENDPOINTS) {
    try {
      const rows = await scrapeStaticEndpoint(endpoint);
      result.data.push(...rows);
      console.log(`  ✔ [Cheerio] ${endpoint.stateName}: ${rows.length} rows`);
    } catch (err) {
      result.errors.push({
        stage: "scrape",
        message: `Cheerio ${endpoint.stateName}: ${err.message}`
      });
    }
  }

  result.success = result.data.length > 0;
  console.log(`🔄 [Cheerio] Done. Total rows: ${result.data.length}`);

  return result;
};
