import cron from "node-cron";
import { runDataGovScraper } from "../scrapers/dataGovScraper.js";
import { runCheerioScraper } from "../scrapers/cheerioScraper.js";
import { cleanMandiData } from "../services/mandiDataCleaner.js";
import MandiPrice from "../models/MandiPrice.js";
import ScraperLog from "../models/ScraperLog.js";

/**
 * Main scraper pipeline
 */
export const runScraperPipeline = async () => {
  const startTime = Date.now();
  const logEntry = new ScraperLog();

  try {
    console.log(`\n⏳ [Mandi Cron] Starting daily scrape at ${new Date().toISOString()}`);

    // 1. Primary: data.gov.in official API (no browser required, works on Render)
    let scrapeResult = await runDataGovScraper();
    logEntry.scraperUsed = "datagov";

    // 2. Fallback to Cheerio if API returns no data
    if (!scrapeResult.success || scrapeResult.data.length === 0) {
      console.log(`⚠️ [Mandi Cron] DataGov returned 0 rows. Trying Cheerio fallback...`);
      scrapeResult = await runCheerioScraper();
      logEntry.scraperUsed = "cheerio";
    }

    if (!scrapeResult.success || scrapeResult.data.length === 0) {
      logEntry.status = "failed";
      logEntry.errorLogs = [{ stage: "scrape", message: "All scrapers returned 0 records." }];
    } else {
      // 3. Clean Data
      const { cleaned, skipped } = cleanMandiData(scrapeResult.data);
      logEntry.recordsSkipped = skipped;

      if (cleaned.length === 0) {
        logEntry.status = "failed";
        logEntry.errorLogs = [{ stage: "clean", message: "All scraped records were invalid." }];
      } else {
        // 4. Bulk Upsert
        const bulkOps = cleaned.map((record) => {
          const dateStart = new Date(record.date);
          dateStart.setUTCHours(0, 0, 0, 0);
          const dateEnd = new Date(record.date);
          dateEnd.setUTCHours(23, 59, 59, 999);

          return {
            updateOne: {
              filter: {
                crop: record.crop,
                mandi: record.mandi,
                date: { $gte: dateStart, $lte: dateEnd },
              },
              update: { $set: record },
              upsert: true,
            },
          };
        });

        const bulkResult = await MandiPrice.bulkWrite(bulkOps);
        logEntry.recordsSaved = bulkResult.upsertedCount + bulkResult.modifiedCount;
        logEntry.status = scrapeResult.errors?.length > 0 ? "partial" : "success";

        console.log(`✅ [Mandi Cron] Saved ${logEntry.recordsSaved} records to DB.`);
      }
    }
  } catch (error) {
    console.error("❌ [Mandi Cron] Unexpected Error:", error);
    logEntry.status = "failed";
    logEntry.errorLogs = [{ stage: "pipeline", message: error.message }];
  } finally {
    logEntry.durationMs = Date.now() - startTime;
    await logEntry.save();
    console.log(`🏁 [Mandi Cron] Pipeline finished in ${logEntry.durationMs}ms — status: ${logEntry.status}`);
  }
};

/**
 * Initialize Mandi Cron Job
 */
export const initMandiCron = () => {
  // Run at 10:30 IST (05:00 UTC) — Agmarknet publishes data between 9-12 AM IST
  cron.schedule("0 5 * * *", () => {
    runScraperPipeline();
  });
  console.log("⏰ Mandi Cron Job Initialized (Runs daily at 10:30 IST)");
};
