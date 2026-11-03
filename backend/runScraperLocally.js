import mongoose from "mongoose";
import dotenv from "dotenv";
import { runScraperPipeline } from "./src/jobs/mandiCron.js";

dotenv.config();

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");
    
    await runScraperPipeline();
    
    console.log("Done. Disconnecting...");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
