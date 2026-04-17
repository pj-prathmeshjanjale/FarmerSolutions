import mongoose from "mongoose";

const weatherCacheSchema = new mongoose.Schema(
  {
    locationKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    current: {
      type: Object,
      required: true
    },
    forecast: {
      type: Array,
      default: []
    },
    insights: {
      type: Object,
      default: null
    },
    // TTL Index: automatically delete cached weather after 3 hours
    // to force a fresh API fetch and new AI generation
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3 * 60 * 60 // 3 hours
    }
  },
  { timestamps: true }
);

// We index by locationKey to find it quickly
weatherCacheSchema.index({ locationKey: 1 });

export default mongoose.model("WeatherCache", weatherCacheSchema);
