import "dotenv/config";
import connectDB from "../config/db.js";
import MandiPrice from "../models/MandiPrice.js";

const seedData = async () => {
  try {
    await connectDB();
    console.log("Seeding test mandi data...");
    
    const crops = ["soyabean", "wheat", "potato", "cabbage", "onion", "cotton"];
    const mandis = ["pune", "latur", "nashik", "jalgaon"];
    
    for (const crop of crops) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        for (const mandi of mandis) {
          
          let basePrice = 2000;
          if (crop === "soyabean") basePrice = Math.floor(Math.random() * 800) + 4200;
          if (crop === "wheat") basePrice = Math.floor(Math.random() * 300) + 2200;
          if (crop === "potato") basePrice = Math.floor(Math.random() * 500) + 1200;
          if (crop === "cabbage") basePrice = Math.floor(Math.random() * 400) + 800;
          if (crop === "onion") basePrice = Math.floor(Math.random() * 600) + 1500;
          if (crop === "cotton") basePrice = Math.floor(Math.random() * 1000) + 6500;
          
          await MandiPrice.updateOne(
            { crop: crop, mandi: mandi, date: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())) },
            {
              $set: {
                crop: crop,
                mandi: mandi,
                state: "maharashtra",
                district: "test_dist",
                minPrice: basePrice - 200,
                maxPrice: basePrice + 300,
                modalPrice: basePrice,
                unit: "₹/quintal",
                source: "scraped",
                date: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
              }
            },
            { upsert: true }
          );
        }
      }
    }
    
    console.log("Seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
