import mongoose from "mongoose";

const rentalRequestSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    proposedPricePerDay: {
      type: Number,
      required: true
    },

    shippingCharge: {
      type: Number,
      default: 0
    },

    message: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

export default mongoose.model("RentalRequest", rentalRequestSchema);
