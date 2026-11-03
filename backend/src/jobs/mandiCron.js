import cron from "node-cron";
import { runDataGovScraper } from "../scrapers/dataGovScraper.js";
import { runCheerioScraper } from "../scrapers/cheerioScraper.js";
import { runSeedScraper } from "../scrapers/seedScraper.js";
import { cleanMandiData } from "../services/mandiDataCleaner.js";
import MandiPrice from "../models/MandiPrice.js";
import ScraperLog from "../models/ScraperLog.js";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Main scraper pipeline
 */
export const runScraperPipeline = async () => {
  const startTime = Date.now();
  const logEntry = new ScraperLog();

  try {
    console.log(`\n⏳ [Mandi Cron] Starting daily scrape at ${new Date().toISOString()}`);

    // 1. Primary: data.gov.in official API
    let scrapeResult = await runDataGovScraper();
    logEntry.scraperUsed = "datagov";

    // 2. Fallback to Cheerio
    if (!scrapeResult.success || scrapeResult.data.length === 0) {
      console.log(`⚠️ [Mandi Cron] DataGov returned 0 rows. Trying Cheerio fallback...`);
      scrapeResult = await runCheerioScraper();
      logEntry.scraperUsed = "cheerio";
    }

    // 3. Final fallback: seed with realistic hardcoded prices
    if (!scrapeResult.success || scrapeResult.data.length === 0) {
      console.log(`⚠️ [Mandi Cron] Cheerio also failed. Using seed data fallback...`);
      scrapeResult = runSeedScraper();
      logEntry.scraperUsed = "seed";
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
 * Check if we need to run the pipeline immediately on startup.
 * Returns true if DB is empty OR last successful run was > 6 hours ago.
 */
const shouldRunOnStartup = async () => {
  try {
    const totalRecords = await MandiPrice.estimatedDocumentCount();
    if (totalRecords === 0) {
      console.log("📭 [Mandi Cron] DB is empty — triggering immediate scrape.");
      return true;
    }

    const lastLog = await ScraperLog.findOne({ status: { $in: ["success", "partial"] } })
      .sort({ runAt: -1 })
      .lean();

    if (!lastLog) {
      console.log("📋 [Mandi Cron] No successful scrape log found — triggering scrape.");
      return true;
    }

    const hoursSinceLast = (Date.now() - new Date(lastLog.runAt).getTime()) / SIX_HOURS_MS;
    if (hoursSinceLast >= 1) {
      console.log(`🕐 [Mandi Cron] Last scrape was ${(hoursSinceLast * 6).toFixed(1)}h ago — triggering refresh.`);
      return true;
    }

    console.log("✅ [Mandi Cron] Recent data found in DB — skipping startup scrape.");
    return false;
  } catch (err) {
    console.error("[Mandi Cron] Error checking startup condition:", err.message);
    return true; // Run anyway if we can't check
  }
};

/**
 * Initialize Mandi Cron Job
 */
export const initMandiCron = async () => {
  // 1. Run immediately on startup if data is stale or DB is empty
  const needsImmediateRun = await shouldRunOnStartup();
  if (needsImmediateRun) {
    // Run asynchronously so it doesn't block server startup
    setImmediate(() => runScraperPipeline());
  }

  // 2. Schedule daily at 10:30 IST (05:00 UTC) — Agmarknet publishes data between 9-12 AM IST
  cron.schedule("0 5 * * *", () => {
    runScraperPipeline();
  });

  console.log("⏰ Mandi Cron Job Initialized (Runs daily at 10:30 IST + on startup if stale)");
};
