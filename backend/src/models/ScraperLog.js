import mongoose from "mongoose";

const scraperLogSchema = new mongoose.Schema(
  {
    runAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      required: true
    },
    // Which scraper ran: "puppeteer" | "cheerio" | "fallback-db"
    scraperUsed: {
      type: String,
      default: "puppeteer"
    },
    recordsSaved: {
      type: Number,
      default: 0
    },
    recordsSkipped: {
      type: Number,
      default: 0
    },
    // Duration in milliseconds
    durationMs: {
      type: Number,
      default: 0
    },
    errorLogs: [
      {
        stage: String,  // "scrape" | "clean" | "save"
        message: String,
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Keep only the last 90 days of logs (TTL index)
scraperLogSchema.index({ runAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model("ScraperLog", scraperLogSchema);
