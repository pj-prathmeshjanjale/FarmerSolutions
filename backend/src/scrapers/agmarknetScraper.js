/**
 * agmarknetScraper.js
 * Primary scraper using Puppeteer (headless Chromium).
 * Targets Agmarknet 2.0 React SPA — handles dynamic dropdown + form submission.
 *
 * Returns: { success: boolean, data: [], errors: [], scraperUsed: "puppeteer" }
 * NEVER throws — all errors are caught and returned in the result.
 */

import puppeteer from "puppeteer";

const AGMARKNET_URL = "https://agmarknet.gov.in/";
const MAX_RETRIES = 3;
const PAGE_TIMEOUT = 45000; // 45 seconds per attempt
const NAV_TIMEOUT = 30000;

// Crop + State pairs to scrape on each daily run
// Covers major Indian food & cash crops across key agricultural states
const SCRAPE_TARGETS = [
  { state: "Maharashtra", crops: ["soyabean", "cotton", "onion", "tomato", "wheat", "jowar", "tur"] },
  { state: "Punjab",      crops: ["wheat", "paddy", "maize", "sunflower"] },
  { state: "Karnataka",   crops: ["ragi", "groundnut", "maize", "cotton", "tomato"] },
  { state: "Uttar Pradesh", crops: ["wheat", "paddy", "potato", "mustard", "sugarcane"] },
  { state: "Rajasthan",   crops: ["mustard", "bajra", "jowar", "moth", "guar seed"] },
  { state: "Madhya Pradesh", crops: ["soyabean", "wheat", "gram", "linseed", "maize"] },
];

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Parse a price table row from scraped text cells
 * Expected col order (Agmarknet report view):
 *  State | District | Market | Commodity | Variety | Grade | Min | Max | Modal | Date
 */
const parseRow = (cells) => {
  if (cells.length < 9) return null;

  const minPrice  = parseFloat(cells[6]?.replace(/,/g, "").trim());
  const maxPrice  = parseFloat(cells[7]?.replace(/,/g, "").trim());
  const modalPrice = parseFloat(cells[8]?.replace(/,/g, "").trim());

  if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(modalPrice)) return null;

  return {
    state:      cells[0]?.trim().toLowerCase() || "",
    district:   cells[1]?.trim().toLowerCase() || "",
    mandi:      cells[2]?.trim().toLowerCase() || "",
    crop:       cells[3]?.trim().toLowerCase() || "",
    minPrice,
    maxPrice,
    modalPrice,
    date:       new Date(cells[9]?.trim() || Date.now()),
    source:     "scraped"
  };
};

/**
 * Scrape one state-crop combination.
 * Returns array of parsed price rows.
 */
const scrapeOneCombination = async (page, stateName, cropName) => {
  const rows = [];

  try {
    // Navigate to the price report page
    await page.goto(`${AGMARKNET_URL}SearchMarket/ArrivedPriceAllCommodities`, {
      waitUntil: "networkidle2",
      timeout: NAV_TIMEOUT
    });

    // Wait for the form to be ready
    await page.waitForSelector("select, input[type='text']", { timeout: 10000 });

    // Try to select state from dropdown
    const stateSelected = await page.evaluate((name) => {
      const selects = Array.from(document.querySelectorAll("select"));
      for (const sel of selects) {
        const options = Array.from(sel.options);
        const match = options.find(
          (o) => o.text.toLowerCase().includes(name.toLowerCase())
        );
        if (match) {
          sel.value = match.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      }
      return false;
    }, stateName);

    if (!stateSelected) return rows;
    await sleep(1500); // Wait for dependent dropdowns to load

    // Try to select crop from another dropdown
    const cropSelected = await page.evaluate((name) => {
      const selects = Array.from(document.querySelectorAll("select"));
      for (const sel of selects) {
        const options = Array.from(sel.options);
        const match = options.find(
          (o) => o.text.toLowerCase().includes(name.toLowerCase())
        );
        if (match) {
          sel.value = match.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      }
      return false;
    }, cropName);

    if (!cropSelected) return rows;
    await sleep(1000);

    // Submit the search form
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button, input[type='submit']"));
      const submitBtn = buttons.find(
        (b) => b.textContent?.toLowerCase().includes("go") ||
               b.textContent?.toLowerCase().includes("search") ||
               b.textContent?.toLowerCase().includes("submit") ||
               b.type === "submit"
      );
      if (submitBtn) submitBtn.click();
    });

    // Wait for results table
    await page.waitForSelector("table tbody tr", { timeout: 12000 }).catch(() => null);
    await sleep(2000);

    // Extract table data
    const tableData = await page.evaluate(() => {
      const tables = document.querySelectorAll("table");
      const allRows = [];

      for (const table of tables) {
        const trs = table.querySelectorAll("tbody tr");
        for (const tr of trs) {
          const tds = Array.from(tr.querySelectorAll("td, th"));
          if (tds.length >= 7) {
            allRows.push(tds.map((td) => td.innerText?.trim() || ""));
          }
        }
      }
      return allRows;
    });

    for (const cells of tableData) {
      const parsed = parseRow(cells);
      if (parsed) rows.push(parsed);
    }

  } catch (err) {
    // Silently return whatever rows we got
  }

  return rows;
};

/**
 * Main export: run the puppeteer scraper
 * Returns { success, data[], errors[], scraperUsed }
 */
export const runPuppeteerScraper = async () => {
  const result = {
    success: false,
    data: [],
    errors: [],
    scraperUsed: "puppeteer"
  };

  let browser = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🕸️  [Puppeteer] Attempt ${attempt}/${MAX_RETRIES}...`);

      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--disable-extensions"
        ],
        timeout: PAGE_TIMEOUT
      });

      const page = await browser.newPage();
      page.setDefaultTimeout(PAGE_TIMEOUT);
      page.setDefaultNavigationTimeout(NAV_TIMEOUT);

      // Block unnecessary resources to speed up scraping
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "font", "stylesheet", "media"].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Scrape each target combination
      for (const target of SCRAPE_TARGETS) {
        for (const cropName of target.crops) {
          try {
            const rows = await scrapeOneCombination(page, target.state, cropName);
            result.data.push(...rows);
            console.log(`  ✔ ${target.state}/${cropName}: ${rows.length} rows`);
          } catch (err) {
            result.errors.push({
              stage: "scrape",
              message: `${target.state}/${cropName}: ${err.message}`
            });
          }
          await sleep(500); // Polite delay between requests
        }
      }

      await browser.close();
      browser = null;

      result.success = result.data.length > 0;
      console.log(`🕸️  [Puppeteer] Done. Total rows: ${result.data.length}`);
      break; // Successful attempt — exit retry loop

    } catch (err) {
      console.error(`🕸️  [Puppeteer] Attempt ${attempt} failed: ${err.message}`);
      result.errors.push({ stage: "scrape", message: `Attempt ${attempt}: ${err.message}` });

      if (browser) {
        await browser.close().catch(() => {});
        browser = null;
      }

      if (attempt < MAX_RETRIES) {
        const backoff = attempt * 5000; // 5s, 10s, 15s
        console.log(`  ⏳ Retrying in ${backoff / 1000}s...`);
        await sleep(backoff);
      }
    }
  }

  return result;
};
