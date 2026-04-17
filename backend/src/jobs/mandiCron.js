import cron from "node-cron";
import { runPuppeteerScraper } from "../scrapers/agmarknetScraper.js";
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
    
    // 1. Primary Scraper
    let scrapeResult = await runPuppeteerScraper();
    logEntry.scraperUsed = "puppeteer";
    
    // 2. Fallback Scraper if Primary fails to get data
    if (!scrapeResult.success || scrapeResult.data.length === 0) {
      console.log(`⚠️ [Mandi Cron] Puppeteer failed or returned 0 rows. Using Cheerio fallback...`);
      scrapeResult = await runCheerioScraper();
      logEntry.scraperUsed = "cheerio";
    }

    logEntry.errors = scrapeResult.errors;

    if (!scrapeResult.success || scrapeResult.data.length === 0) {
      logEntry.status = "failed";
      logEntry.errors.push({ stage: "scrape", message: "Both scrapers returned 0 records." });
    } else {
      // 3. Clean Data
      const { cleaned, skipped, report } = cleanMandiData(scrapeResult.data);
      logEntry.recordsSkipped = skipped;
      
      if (cleaned.length === 0) {
        logEntry.status = "failed";
        logEntry.errors.push({ stage: "clean", message: "All scraped records were invalid." });
      } else {
        // 4. Bulk Upsert into Database
        const bulkOps = cleaned.map(record => {
          // Normalize date to string for match
          const dateStart = new Date(record.date);
          dateStart.setUTCHours(0,0,0,0);
          const dateEnd = new Date(record.date);
          dateEnd.setUTCHours(23,59,59,999);

          return {
            updateOne: {
              filter: {
                crop: record.crop,
                mandi: record.mandi,
                date: { $gte: dateStart, $lte: dateEnd }
              },
              update: { $set: record },
              upsert: true
            }
          };
        });

        const bulkResult = await MandiPrice.bulkWrite(bulkOps);
        logEntry.recordsSaved = bulkResult.upsertedCount + bulkResult.modifiedCount;
        logEntry.status = scrapeResult.errors.length > 0 ? "partial" : "success";
        
        console.log(`✅ [Mandi Cron] Saved ${logEntry.recordsSaved} records to DB.`);
      }
    }
  } catch (error) {
    console.error("❌ [Mandi Cron] Unexpected Error:", error);
    logEntry.status = "failed";
    logEntry.errors.push({ stage: "pipeline", message: error.message });
  } finally {
    logEntry.durationMs = Date.now() - startTime;
    await logEntry.save();
    console.log(`🏁 [Mandi Cron] Pipeline finished in ${logEntry.durationMs}ms with status: ${logEntry.status}`);
  }
};

/**
 * Initialize Mandi Cron Job
 */
export const initMandiCron = () => {
  // Run at 06:00 IST (00:30 UTC) every day
  cron.schedule("30 0 * * *", () => {
    runScraperPipeline();
  });
  console.log("⏰ Mandi Cron Job Initialized (Runs daily at 06:00 IST)");
};
