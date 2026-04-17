import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      enum: ["tractor", "harvester", "rotavator", "sprayer", "other"]
    },

    description: {
      type: String,
      required: true
    },

    images: [
      {
        type: String,
        required: true
      }
    ],

    pricePerDay: { // Legacy field, keeping for compatibility
      type: Number
    },

    price: {
      type: Number,
      required: true
    },

    priceUnit: {
      type: String,
      enum: ["hour", "day", "acre"],
      default: "day"
    },

    priceNote: {
      type: String,
      trim: true
    },

    minimumRentalDays: {
      type: Number,
      default: 1
    },

    shippingCharge: {
      type: Number,
      default: 0
    },

    negotiable: {
      type: Boolean,
      default: true
    },

    availability: {
      type: Boolean,
      default: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },
    approved: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Equipment", equipmentSchema);
