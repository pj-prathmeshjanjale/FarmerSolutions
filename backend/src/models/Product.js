import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["seed", "pesticide", "fertilizer"],
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    unitValue: {
      type: Number,
      required: true,
      default: 1
    },
    unit: {
      type: String,
      enum: ["kg", "g", "L", "ml", "packet", "bag", "quintal", "ton", "piece"],
      required: true,
      default: "kg"
    },
    stock: {
      type: Number,
      required: true
    },
    images: [String],
    suitableCrops: [String],
    suitableSoil: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
