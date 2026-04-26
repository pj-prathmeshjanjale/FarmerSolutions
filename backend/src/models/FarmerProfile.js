import mongoose from "mongoose";

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    // Keep raw address info if needed, but 'location' below serves GeoJSON mapping
    village: String,
    taluka: String,
    district: String,
    state: String,
    pincode: String,
    preferredLanguage: {
      type: String,
      default: "en"
    },

    // --- NEW: Structural GeoJSON Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        index: "2dsphere" // Longitude, Latitude
      }
    },

    // --- NEW: AI Context Metrics
    soilType: {
      type: String,
      enum: ["black", "red", "alluvial", "sandy", "clay"]
    },
    irrigationType: {
      type: String,
      enum: ["drip", "sprinkler", "canal", "rainfed", "manual"]
    },
    waterSource: {
      type: String,
      enum: ["borewell", "canal", "rainfed"]
    },
    farmingExperience: {
      type: Number, // In years
      min: 0,
      max: 100
    },
    farmSize: {
      type: Number, // In acres
      min: 0
    },
    soilPH: {
      type: Number,
      min: 0,
      max: 14
    },
    lastCropSeason: {
      type: String,
      enum: ["kharif", "rabi", "zaid"]
    },
    budgetRange: {
      type: String,
      enum: ["low", "medium", "high"]
    },
    equipmentAccess: {
      type: String,
      enum: ["owned_heavy", "owned_light", "rented", "manual_labor"]
    },
    farmingMethod: {
      type: String,
      enum: ["organic", "conventional", "integrated"]
    },
    primaryChallenge: {
      type: String,
      enum: ["pest_control", "water_scarcity", "yield_optimization", "soil_degradation", "disease_management"]
    },
    cropCategory: {
      type: String,
      enum: ["cash_crops", "cereals", "horticulture", "pulses"]
    },

    // --- NEW: Sub-Document Array for Crop History
    cropHistory: [
      {
        crop: { type: String, required: true },
        season: { type: String, enum: ["kharif", "rabi", "zaid"], required: true },
        year: { type: Number, required: true },
        yield: { type: Number, required: true } // Value representing metric (e.g. quintals)
      }
    ]
  },
  { timestamps: true }
);

const FarmerProfile = mongoose.model("FarmerProfile", farmerProfileSchema);

export default FarmerProfile;
