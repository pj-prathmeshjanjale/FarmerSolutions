import mongoose from "mongoose";

const mandiPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    mandi: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    district: {
      type: String,
      lowercase: true,
      trim: true,
      default: ""
    },
    minPrice: {
      type: Number,
      required: true
    },
    maxPrice: {
      type: Number,
      required: true
    },
    modalPrice: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: "₹/quintal"
    },
    source: {
      type: String,
      enum: ["scraped", "community"],
      default: "scraped"
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index for efficient filtering
mandiPriceSchema.index({ crop: 1, state: 1, date: -1 });

// Unique constraint: same crop at same mandi on same date = 1 record
mandiPriceSchema.index({ crop: 1, mandi: 1, date: 1 }, { unique: true });

// TTL index to automatically delete records older than 14 days (saves DB space)
mandiPriceSchema.index({ date: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });


export default mongoose.model("MandiPrice", mandiPriceSchema);
