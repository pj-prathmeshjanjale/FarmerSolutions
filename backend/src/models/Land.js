import mongoose from "mongoose";

const landSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    landName: {
      type: String,
      required: true
    },
    area: {
      type: Number,
      required: true
    },
    areaUnit: {
      type: String,
      enum: ["acre", "hectare"],
      default: "acre"
    },
    soilType: String,
    irrigationType: {
      type: String,
      enum: ["rainfed", "canal", "drip", "borewell"]
    },
    crop: String,
    location: {
      latitude: Number,
      longitude: Number
    }
  },
  { timestamps: true }
);

const Land = mongoose.model("Land", landSchema);

export default Land;
