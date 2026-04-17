import mongoose from "mongoose";

const communityPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    location: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    state: {
      type: String,
      lowercase: true,
      trim: true,
      default: ""
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Trust score: 0–100. Verified farmers start at 60, unverified at 30.
    // Increases when multiple users submit matching prices.
    trustScore: {
      type: Number,
      default: 30,
      min: 0,
      max: 100
    },
    // Whether admin has verified this submission
    verified: {
      type: Boolean,
      default: false
    },
    // Flagged as statistical outlier
    isOutlier: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Efficient lookups by crop + location over time
communityPriceSchema.index({ crop: 1, location: 1, createdAt: -1 });
communityPriceSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("CommunityPrice", communityPriceSchema);
