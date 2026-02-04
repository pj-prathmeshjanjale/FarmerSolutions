import mongoose from "mongoose";

const mandiPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    market: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
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
      default: "Agmarknet (cached)"
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("MandiPrice", mandiPriceSchema);
