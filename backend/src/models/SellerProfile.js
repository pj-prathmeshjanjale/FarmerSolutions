import mongoose from "mongoose";

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    businessName: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    },
    address: String,
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const SellerProfile = mongoose.model("SellerProfile", sellerProfileSchema);

export default SellerProfile;
