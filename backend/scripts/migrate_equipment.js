import mongoose from "mongoose";
import dotenv from "dotenv";
import Equipment from "./src/models/Equipment.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const equipments = await Equipment.find({ price: { $exists: false } });
    console.log(`Found ${equipments.length} equipments to migrate`);

    for (const eq of equipments) {
      eq.price = eq.pricePerDay;
      eq.priceUnit = "day";
      await eq.save();
    }

    console.log("Migration successful");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

migrate();
