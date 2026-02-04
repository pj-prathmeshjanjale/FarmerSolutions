import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js"; // Corrected import
import bcrypt from "bcryptjs";

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = "";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("ℹ️ Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("", 10);

        const newAdmin = new User({
            name: "Admin User",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            verificationStatus: "approved"
        });

        await newAdmin.save();
        console.log("🎉 Admin created successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
};

seedAdmin();
