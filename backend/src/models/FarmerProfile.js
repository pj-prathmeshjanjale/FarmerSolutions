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
    village: String,
    taluka: String,
    district: String,
    state: String,
    pincode: String,
    preferredLanguage: {
      type: String,
      default: "en"
    }
  },
  { timestamps: true }
);

const FarmerProfile = mongoose.model("FarmerProfile", farmerProfileSchema);

export default FarmerProfile;
