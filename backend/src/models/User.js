import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["farmer", "seller", "buyer", "admin"],
      default: "farmer",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "seller" ? "pending" : "approved";
      }
    },
    razorpayAccountId: {
      type: String, // Stores linked account ID like "acc_12345678"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
