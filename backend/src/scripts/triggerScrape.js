import "dotenv/config";
import connectDB from "../config/db.js";
import { runScraperPipeline } from "../jobs/mandiCron.js";

const trigger = async () => {
  try {
    await connectDB();
    console.log("Triggering manual mandi scrape...");
    await runScraperPipeline();
    console.log("Manual scrape finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Manual scrape failed:", err);
    process.exit(1);
  }
};

trigger();
